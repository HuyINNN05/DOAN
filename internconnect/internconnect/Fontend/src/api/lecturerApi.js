import{api}from'./client';const data=r=>r.data.data
export const getStudents=()=>api.get('/lecturer/students').then(data);export const getInternships=()=>api.get('/lecturer/internships').then(data);export const getDiaries=()=>api.get('/lecturer/diaries').then(data);export const feedback=(id,text)=>api.post(`/lecturer/diaries/${id}/feedback`,{feedback:text}).then(data);export const getReports=(params={})=>api.get('/lecturer/reports',{params}).then(data);export const reviewReport=(id,input)=>api.post(`/lecturer/reports/${id}/review`,input).then(data);export const getCriteria=()=>api.get('/lecturer/evaluation-criteria').then(data);export const evaluate=(id,input)=>api.post(`/lecturer/internships/${id}/evaluations`,input).then(data)

export const scoreReport=(id,input)=>api.post(`/lecturer/reports/${id}/score`,input).then(data)

export const startEvaluation=id=>api.post(`/lecturer/internships/${id}/start-evaluation`).then(data)
