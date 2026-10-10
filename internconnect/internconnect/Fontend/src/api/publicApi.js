import{api}from'./client'
export async function lookupCompany(query){const{data}=await api.get('/public/companies/lookup',{params:{query}});return data.data}
export async function listJobs(params={}){const{data}=await api.get('/jobs',{params});return data.data}
export async function getJob(id){const{data}=await api.get(`/jobs/${id}`);return data.data}
export async function listCompanies(){const{data}=await api.get('/public/companies');return data.data}
