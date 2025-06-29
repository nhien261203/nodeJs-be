import express from 'express';
import brandRoutes from './admin/brand.routes.js';
import categoryRoutes from './admin/category.routes.js';

// import categoryRoutes from './admin/category.routes.js';

const router = express.Router();

router.use('/admin/brands', brandRoutes);
router.use('/admin/categories', categoryRoutes);

export default router;
