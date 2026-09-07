import defaultCompany from '../data/company.json'
import defaultJobs from '../data/companyJobs.json'
const COMPANY_KEY = 'internconnect_company'; const JOBS_KEY = 'internconnect_company_jobs'
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback } }
export function getCompany() { return read(COMPANY_KEY, defaultCompany) }
export function saveCompany(value) { localStorage.setItem(COMPANY_KEY, JSON.stringify(value)); return value }
export function getJobs() { return read(JOBS_KEY, defaultJobs) }
export function saveJobs(value) { localStorage.setItem(JOBS_KEY, JSON.stringify(value)); return value }
