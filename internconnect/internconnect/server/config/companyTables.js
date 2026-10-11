import { env } from './env.js'

// Both schemas use the same MySQL server and connection so cross-schema
// foreign keys, joins and transactions retain their integrity guarantees.
const names = ['companies', 'company_accounts', 'jobs', 'applications', 'application_events', 'interviews']
export const companyTables = Object.freeze(Object.fromEntries(
  names.map(name => [name, `\`${env.DB_COMPANY_NAME}\`.\`${name}\``]),
))
