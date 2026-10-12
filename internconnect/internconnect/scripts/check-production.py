"""Read resolved Compose JSON via stdin; never print environment values."""
import json
import os
import subprocess
import sys


def require(condition, message):
    if not condition:
        raise SystemExit(message)


def inspect(kind, name):
    result = subprocess.run(['docker', kind, 'inspect', name], capture_output=True)
    require(result.returncode == 0, f'Existing {kind} not found; verify its name.')
    return json.loads(result.stdout)[0]


config = json.load(sys.stdin)
api = config['services']['api']
env = api['environment']
require(set(config['services']) == {'api', 'nginx'}, 'Unexpected production services.')
require(not api.get('ports'), 'API must not expose ports.')
require(env.get('NODE_ENV') == 'production', 'NODE_ENV must be production.')
require(str(env.get('TRUST_PROXY_HOPS')) == '1', 'This Nginx topology requires one trusted hop.')
for key in ('JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'DB_PASSWORD'):
    value = env.get(key, '')
    require(bool(value) and not any(marker in value.lower() for marker in
            ('development-', 'change_me', 'change-me', 'replace_with', 'internconnect_local_root')),
            f'{key} is missing or a placeholder.')
    if key.startswith('JWT_'):
        require(len(value) >= 32, f'{key} must contain at least 32 characters.')
require(env['JWT_ACCESS_SECRET'] != env['JWT_REFRESH_SECRET'], 'JWT secrets must differ.')
require(env.get('DB_SCHOOL_NAME') and env.get('DB_COMPANY_NAME') and
        env['DB_SCHOOL_NAME'] != env['DB_COMPANY_NAME'], 'Verify two distinct database names.')
require(env.get('DB_HOST') not in ('localhost', '127.0.0.1', ''), 'DB_HOST cannot be container loopback.')
require(int(env.get('MAX_UPLOAD_BYTES', 5242880)) <= 5242880,
        'Increase Nginx client_max_body_size before increasing upload limit above 5 MiB.')
require('*' not in env.get('CORS_ORIGIN', '').split(','), 'CORS wildcard is forbidden.')
require(not env.get('APP_PUBLIC_URL') or env['APP_PUBLIC_URL'].startswith('https://'),
        'APP_PUBLIC_URL must use public HTTPS; leave empty until Quick Tunnel is known.')
for port in config['services']['nginx'].get('ports', []):
    require(port.get('host_ip') == '127.0.0.1', 'Nginx must bind host loopback.')
mount = next(item for item in api['volumes'] if item['target'] == '/app/uploads')
if mount['type'] == 'bind':
    require(os.path.isabs(mount['source']) and os.path.isdir(mount['source']),
            'Existing absolute uploads directory not found.')
    info = os.stat(mount['source'])
    require((info.st_uid == 1000 and info.st_mode & 0o300 == 0o300) or
            (info.st_gid == 1000 and info.st_mode & 0o030 == 0o030) or
            info.st_mode & 0o003 == 0o003,
            'Node UID/GID 1000 needs write and traversal permissions; verify ACLs manually if used.')
else:
    volume = config['volumes'][mount['source']]
    require(volume.get('external'), 'Uploads volume must be external.')
    inspect('volume', volume['name'])
if sys.argv[1] == 'docker':
    network = config['networks']['existing_db']
    require(network.get('external'), 'DB network must be external.')
    inspect('network', network['name'])
else:
    require(env['DB_HOST'] == 'host.docker.internal', 'Host mode expects host.docker.internal.')
print('Environment, loopback exposure and existing storage/network checks passed (no secrets printed).')
