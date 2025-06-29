import db from '../../models/index.js'
import { validationResult } from 'express-validator'
import { Op } from 'sequelize'
import { resizeAndSaveImage, deleteFileIfExists } from '../../utils/admin/resizeAndSaveImage.js'
import path from 'path'
import fs from 'fs'
import slugify from 'slugify';


const Brand = db.Brand

// GET /api/brands?search=apple&status=1&page=1&limit=5
export const getBrands = async (req, res) => {
    try {
        const {
            search = '',
            status,
            country,
            page = 1,
            limit = 10
        } = req.query;

        const where = {};

        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }
        if (status !== undefined && status !== '') {
            const statusNum = parseInt(status);
            if (isNaN(statusNum)) {
                return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
            }
            where.status = statusNum;
        }

        if (country) {
            where.country = { [Op.like]: `%${country}%` };
        }

        const offset = (page - 1) * limit;

        const { rows, count } = await Brand.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        // Bổ sung: fallback logo nếu cần
        const rowsWithLogo = rows.map(b => ({
            ...b.toJSON(),
            logo: b.logo || '/uploads/brands/default.png'
        }));

        return res.json({
            data: rowsWithLogo,
            total: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};


// GET /api/brands/:id
export const getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findByPk(req.params.id);
        if (!brand) return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });

        const brandData = brand.toJSON();
        if (!brandData.logo) {
            brandData.logo = '/uploads/brands/default.png';
        }

        res.json(brandData);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};




export const createBrand = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
        const { name, slug: inputSlug, country, status } = req.body;

        const slug = inputSlug?.trim() || slugify(name, { lower: true, strict: true });

        const existed = await Brand.findOne({ where: { slug } });
        if (existed) return res.status(400).json({ message: 'Slug đã tồn tại' });

        let logo = null;
        if (req.file) {
            const filename = `${slug}-${Date.now()}.webp`;
            await resizeAndSaveImage(req.file.buffer, filename, 'uploads/brands');
            logo = `/uploads/brands/${filename}`;
        }

        const brand = await Brand.create({ name, slug, logo, country, status });
        res.status(201).json(brand);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};


export const updateBrand = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
        const { name, slug: inputSlug, country, status } = req.body;
        const brand = await Brand.findByPk(req.params.id);
        if (!brand) return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });

        const slug = inputSlug?.trim() || slugify(name, { lower: true, strict: true });

        if (slug && slug !== brand.slug) {
            const existed = await Brand.findOne({ where: { slug, id: { [Op.ne]: brand.id } } });
            if (existed) return res.status(400).json({ message: 'Slug đã tồn tại' });
        }

        let logo = brand.logo;
        if (req.file) {
            if (logo) {
                const oldFilename = path.basename(logo);
                deleteFileIfExists(path.join('uploads/brands', oldFilename));
            }

            const filename = `${slug}-${Date.now()}.webp`;
            await resizeAndSaveImage(req.file.buffer, filename, 'uploads/brands');
            logo = `/uploads/brands/${filename}`;
        }

        await brand.update({ name, slug, logo, country, status });
        res.json(brand);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};


// DELETE /api/brands/:id
export const deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findByPk(req.params.id)
        if (!brand) return res.status(404).json({ message: 'Không tìm thấy thương hiệu' })

        await brand.destroy()
        res.json({ message: 'Xoá thương hiệu thành công' })
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' })
    }
}

export const getBrandCountries = async (req, res) => {
    try {
        const brands = await Brand.findAll({
            attributes: ['country'],
            group: ['country'],
            where: {
                country: {
                    [Op.not]: null
                }
            }
        })

        const countries = brands.map(b => b.country).filter(Boolean)
        res.json(countries)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách quốc gia' })
    }
}

