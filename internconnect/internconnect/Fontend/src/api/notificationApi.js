import { api } from './client'
export async function listNotifications(){const{data}=await api.get('/notifications');return data.data.items}
export async function readNotification(id){await api.patch(`/notifications/${id}/read`)}
export async function readAllNotifications(){await api.patch('/notifications/read-all')}
export async function broadcastNotification(input){const{data}=await api.post('/admin/notifications',input);return data.data}
