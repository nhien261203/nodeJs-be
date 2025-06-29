import express from 'express'
import {
    getBrands, getBrandById, createBrand, updateBrand, deleteBrand, getBrandCountries
} from '../../controllers/admin/brand.controller.js'
import { check } from 'express-validator'
import { brandLogoUpload } from '../../middlewares/admin/uploadMiddleware.js'
import { validateRequest } from '../../middlewares/validateRequest.js'

const router = express.Router()

const brandValidator = [
    check('name').notEmpty().withMessage('Tên không được để trống'),
    check('slug').optional().isString().withMessage('Slug phải là chuỗi nếu nhập vào'),
    check('status').isInt({ min: 0, max: 1 }).withMessage('Status phải là 0 hoặc 1')
]

router.get('/', getBrands)
router.get('/countries', getBrandCountries)
router.get('/:id', getBrandById)

router.post('/', brandLogoUpload, brandValidator, validateRequest, createBrand)
router.put('/:id', brandLogoUpload, brandValidator, validateRequest, updateBrand)
router.delete('/:id', deleteBrand)

export default router
