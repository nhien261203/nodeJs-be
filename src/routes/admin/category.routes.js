import express from 'express'
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from '../../controllers/admin/category.controller.js'

import { check } from 'express-validator'
import { validateRequest } from '../../middlewares/validateRequest.js'

const router = express.Router()

// ✅ Validator chung cho create & update
const categoryValidator = [
    check('name')
        .notEmpty()
        .withMessage('Tên danh mục không được để trống'),

    check('slug')
        .optional()
        .isString()
        .withMessage('Slug phải là chuỗi nếu nhập'),

    check('status')
        .optional()
        .isInt({ min: 0, max: 1 })
        .withMessage('Trạng thái phải là 0 hoặc 1'),
]

router.get('/', getCategories)
router.get('/:id', getCategoryById)

router.post('/', categoryValidator, validateRequest, createCategory)
router.put('/:id', categoryValidator, validateRequest, updateCategory)

router.delete('/:id', deleteCategory)

export default router
