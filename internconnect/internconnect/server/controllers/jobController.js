import * as student from '../services/studentService.js'
export const save=async(req,res)=>res.status(201).json({success:true,data:await student.saveJob(req.user.sub,req.params.id)})
export const unsave=async(req,res)=>res.json({success:true,data:await student.unsaveJob(req.user.sub,req.params.id)})
export const apply=async(req,res)=>res.status(201).json({success:true,data:await student.apply(req.user.sub,req.params.id,req.body)})
