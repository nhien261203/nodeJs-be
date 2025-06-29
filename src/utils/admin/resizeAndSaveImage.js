// src/utils/admin/resizeAndSaveImage.js
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

export const resizeAndSaveImage = async (buffer, filename, folder) => {
    const filepath = path.join(folder, filename)

    await sharp(buffer)
        .resize(300, 300, {
            fit: 'inside', // ✅ Giữ nguyên nội dung, không cắt
            withoutEnlargement: true
        })
        .toFormat('webp')
        .toFile(filepath)

    return filename
}

export const deleteFileIfExists = (filepath) => {
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
    }
}
