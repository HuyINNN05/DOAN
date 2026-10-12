import{api}from'./client.js'
export async function lookupCompany(query){const{data}=await api.get('/public/companies/lookup',{params:{query}});return data.data}
export async function listJobs(params={}){const{data}=await api.get('/jobs',{params});return normalizeJobs(data)}
export async function getJob(id){const{data}=await api.get(`/jobs/${id}`);return data.data}
export async function listCompanies(){const{data}=await api.get('/public/companies');if(data?.success!==true||!Array.isArray(data.data))throw new Error('Dữ liệu doanh nghiệp trả về không hợp lệ.');return data.data}

// Invalid envelopes must surface as errors rather than appear as empty lists.
export function normalizeJobs(body) {
  if (body?.success !== true || !Array.isArray(body.data?.items) || body.data.items.some(job => !job || typeof job !== 'object')) {
    throw new Error('Dữ liệu tuyển dụng trả về không hợp lệ.')
  }
  return { ...body.data, items: body.data.items.map(job => ({ ...job, skills: normalizeSkills(job.skills) })) }
}
function normalizeSkills(value) {
  if (typeof value === 'string') {
    try { value = JSON.parse(value) } catch { return [] }
  }
  return Array.isArray(value) ? value.filter(skill => typeof skill === 'string') : []
}
