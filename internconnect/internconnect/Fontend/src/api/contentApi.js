import{api}from'./client';const data=r=>r.data.data
export const listContent=()=>api.get('/content').then(data);export const createContent=x=>api.post('/content',x).then(data);export const updateContent=(id,x)=>api.patch(`/content/${id}`,x).then(data);export const archiveContent=id=>api.delete(`/content/${id}`);export const publicContent=()=>api.get('/content/public').then(data)
