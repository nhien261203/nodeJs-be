// src/controllers/admin/category.controller.js
import db from '../../models/index.js';
const Category = db.Category;
import { Op } from 'sequelize';

// GET /api/categories?page=1&limit=10&search=&status=
export const getCategories = async (req, res) => {
    const { page = 1, limit = 10, search = '', status } = req.query;

    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (status !== undefined) where.status = status;

    try {
        const { count, rows } = await Category.findAndCountAll({
            where,
            limit: +limit,
            offset: (+page - 1) * +limit,
            order: [['createdAt', 'DESC']],
            include: [
                { model: Category, as: 'parent', attributes: ['id', 'name'] }
            ]
        });

        res.json({
            data: rows,
            pagination: {
                total: count,
                current_page: +page,
                per_page: +limit,
                last_page: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách category' });
    }
};

// GET /api/categories/:id
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id, {
            include: [
                { model: Category, as: 'parent', attributes: ['id', 'name'] },
                { model: Category, as: 'children', attributes: ['id', 'name'] }
            ]
        });
        if (!category) return res.status(404).json({ message: 'Không tìm thấy' });
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy chi tiết category' });
    }
};

// POST /api/categories
export const createCategory = async (req, res) => {
    try {
        const { name, slug, parent_id, status } = req.body;

        const exist = await Category.findOne({ where: { slug } });
        if (exist) return res.status(400).json({ message: 'Slug đã tồn tại' });

        const category = await Category.create({ name, slug, parent_id, status });
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi tạo category' });
    }
};

// PUT /api/categories/:id
export const updateCategory = async (req, res) => {
    try {
        const { name, slug, parent_id, status } = req.body;

        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Không tìm thấy' });

        // Kiểm tra slug trùng nếu thay đổi
        if (slug && slug !== category.slug) {
            const exist = await Category.findOne({ where: { slug, id: { [Op.ne]: req.params.id } } });
            if (exist) return res.status(400).json({ message: 'Slug đã tồn tại' });
        }

        await category.update({ name, slug, parent_id, status });
        res.json({ message: 'Cập nhật thành công', category });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi cập nhật category' });
    }
};

// DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Không tìm thấy' });

        // Có thể check nếu category có children thì không xoá
        const hasChildren = await Category.findOne({ where: { parent_id: category.id } });
        if (hasChildren) return res.status(400).json({ message: 'Không thể xoá danh mục cha có danh mục con' });

        await category.destroy();
        res.json({ message: 'Đã xoá thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi xoá category' });
    }
};
