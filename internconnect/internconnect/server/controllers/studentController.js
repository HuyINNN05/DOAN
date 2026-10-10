import * as service from '../services/studentService.js'
import { relativeUploadPath } from '../middleware/uploadMiddleware.js'
import { remove } from '../services/fileStorageService.js'
import { AppError } from '../utils/AppError.js'
export const getProfile=async(req,res)=>res.json({success:true,data:await service.getProfile(req.user.sub)})
export const updateProfile=async(req,res)=>res.json({success:true,data:await service.updateProfile(req.user.sub,req.body)})
export const listCvs=async(req,res)=>res.json({success:true,data:await service.listCvs(req.user.sub)})
export async function createCv(req,res) {
  try {
    const name = req.body.name?.trim()
    if (!name || name.length > 150) throw new AppError(422, 'INVALID_CV_NAME', 'Tên CV phải có từ 1 đến 150 ký tự')
    res.status(201).json({success:true,data:await service.createCv(req.user.sub,{name,path:relativeUploadPath(req.file),originalName:req.file.originalname,size:req.file.size,mimeType:req.file.mimetype})})
  } catch (error) { await remove(req.file.path); throw error }
}
export async function deleteCv(req,res){await service.deleteCv(req.user.sub,req.params.id);res.status(204).end()}
export const setDefaultCv=async(req,res)=>res.json({success:true,data:await service.setDefaultCv(req.user.sub,req.params.id)})
export const savedJobs=async(req,res)=>res.json({success:true,data:await service.savedJobs(req.user.sub)})
export const applications=async(req,res)=>res.json({success:true,data:await service.applications(req.user.sub)})
export const periods=async(_req,res)=>res.json({success:true,data:await service.openPeriods()})
