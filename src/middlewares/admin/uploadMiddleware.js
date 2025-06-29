import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Tạo thư mục nếu chưa có
const createUploadFolder = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
    }
}

const storage = multer.memoryStorage()

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase()
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            return cb(new Error('Chỉ cho phép ảnh JPG, PNG, WEBP'))
        }
        cb(null, true)
    },
    limits: { fileSize: 2 * 1024 * 1024 } // tối đa 2MB
})

export const brandLogoUpload = (req, res, next) => {
    createUploadFolder('uploads/brands')
    upload.single('logo')(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: err.message })
        }
        next()
    })
}
