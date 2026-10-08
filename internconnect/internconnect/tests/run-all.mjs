import { spawn } from 'node:child_process'
import process from 'node:process'

const child = spawn(process.execPath, ['--env-file=.env', '--test', 'tests/*.test.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, RUN_DB_TESTS: '1', RUN_API_TESTS: '1' },
  stdio: 'inherit',
  shell: false,
})

child.on('error', (error) => { console.error(error); process.exitCode = 1 })
child.on('exit', (code) => { process.exitCode = code ?? 1 })
