import { Buffer } from 'node:buffer'
import { z } from 'zod'

export const companyRegistrationSchema = z.object({
  fullName:z.string().trim().min(2,'Người đại diện phải có ít nhất 2 ký tự').max(150),
  email:z.string().trim().pipe(z.email('Email đăng nhập không hợp lệ').max(255)),
  password:z.string().min(8,'Mật khẩu phải có ít nhất 8 ký tự').max(128).refine(value=>Buffer.byteLength(value,'utf8')<=72,{message:'Mật khẩu không được vượt quá 72 byte UTF-8'}),
  phone:z.string().trim().max(30).optional(),
  companyName:z.string().trim().min(2,'Tên doanh nghiệp phải có ít nhất 2 ký tự').max(200),
  taxCode:z.string().trim().min(8,'Mã số thuế phải có ít nhất 8 ký tự').max(50,'Mã số thuế không được vượt quá 50 ký tự'),
  companyEmail:z.string().trim().pipe(z.email('Email doanh nghiệp không hợp lệ').max(255)),
  companyPhone:z.string().trim().max(30).optional(),
  website:z.url().optional().or(z.literal('')),
  address:z.string().trim().max(255).optional(),
  description:z.string().trim().max(5000).optional(),
  industry:z.string().trim().max(150).optional(),
  companySize:z.string().trim().max(50).optional(),
  position:z.string().trim().max(100).optional(),
})
