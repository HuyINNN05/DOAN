import{api}from'./client'
const data=(response)=>response.data.data
export const getProfile=()=>api.get('/students/me').then(data)
export const updateProfile=(input)=>api.patch('/students/me',input).then(data)
export const getCvs=()=>api.get('/students/me/cvs').then(data)
export async function uploadCv(name,file){const body=new FormData();body.append('name',name);body.append('file',file);return api.post('/students/me/cvs',body).then(data)}
export const deleteCv=(id)=>api.delete(`/students/me/cvs/${id}`)
export const defaultCv=(id)=>api.patch(`/students/me/cvs/${id}/default`).then(data)
export const getApplications=()=>api.get('/students/me/applications').then(data)
export const getInterviews=()=>api.get('/students/me/interviews').then(data)
export const respondInterview=(id,input)=>api.post(`/interviews/${id}/respond`,input).then(data)
export const respondOffer=(id,input)=>api.post(`/applications/${id}/offer-response`,input).then(data)
export const getInternship=()=>api.get('/students/me/internship').then(data)
export const getDiaries=()=>api.get('/students/me/diaries').then(data)
export const createDiary=(input)=>api.post('/students/me/diaries',input).then(data)
export const updateDiary=(id,input)=>api.patch(`/students/me/diaries/${id}`,input).then(data)
export const getReports=()=>api.get('/students/me/reports').then(data)
export async function uploadReport(reportType,file){const body=new FormData();body.append('reportType',reportType);body.append('file',file);return api.post('/students/me/reports',body).then(data)}
export const getPeriods=()=>api.get('/students/me/periods').then(data)
export const applyJob=(id,input)=>api.post(`/jobs/${id}/apply`,input).then(data)
export const saveJob=(id)=>api.post(`/jobs/${id}/save`).then(data)
export const unsaveJob=(id)=>api.delete(`/jobs/${id}/save`).then(data)
