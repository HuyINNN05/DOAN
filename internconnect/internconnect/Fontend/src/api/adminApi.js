import{api}from'./client';const data=r=>r.data.data
export const dashboard=()=>api.get('/admin/dashboard').then(data);export const users=(params={})=>api.get('/admin/users',{params}).then(data);export const userStatus=(id,status)=>api.patch(`/admin/users/${id}/status`,{status}).then(data);export const companies=(params={})=>api.get('/admin/companies',{params}).then(data);export const approveCompany=id=>api.post(`/admin/companies/${id}/approve`).then(data);export const rejectCompany=(id,reason)=>api.post(`/admin/companies/${id}/reject`,{reason}).then(data);export const applications=(params={})=>api.get('/admin/applications',{params}).then(data);export const transition=(id,status,note)=>api.post(`/applications/${id}/transition`,{status,note}).then(data);export const periods=()=>api.get('/admin/internship-periods').then(data);export const createPeriod=x=>api.post('/admin/internship-periods',x).then(data);export const openPeriod=id=>api.post(`/admin/internship-periods/${id}/open`).then(data);export const closePeriod=id=>api.post(`/admin/internship-periods/${id}/close`).then(data);export const assignments=()=>api.get('/admin/assignments').then(data);export const assignmentOptions=()=>api.get('/admin/assignments/options').then(data);export const assign=x=>api.post('/admin/assignments',x).then(data);export const audit=(params={})=>api.get('/admin/audit-logs',{params}).then(data)

export const approveApplication=(id,note)=>api.post(`/admin/applications/${id}/approve`,{note}).then(data)

export const jobs=(params={})=>api.get('/admin/jobs',{params}).then(data)
export const reviewJob=(id,input)=>api.post(`/admin/jobs/${id}/review`,input).then(data)

export const createSchoolAccount=input=>api.post('/admin/users',input).then(data)
export const resendActivation=id=>api.post(`/admin/users/${id}/resend-activation`).then(data)
export const importSchoolAccounts=(file,preview=false)=>{const form=new FormData();form.append('file',file);return api.post(`/admin/users/import${preview?'/preview':''}`,form,{timeout:180000}).then(data)}
