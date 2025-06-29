import { Sequelize, DataTypes } from 'sequelize';
import { dbConfig } from '../config/db.config.js';


import brandModel from './admin/brand.model.js';
import categoryModel from './admin/category.model.js';

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        pool: dbConfig.pool,
        logging: false,
    }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Khởi tạo model
// db.User = userModel(sequelize, DataTypes);
db.Brand = brandModel(sequelize, DataTypes);
db.Category = categoryModel(sequelize, DataTypes);

//Khai báo quan hệ phân cấp cho Category (self-reference)
db.Category.hasMany(db.Category, {
    foreignKey: 'parent_id',
    as: 'children',
});

db.Category.belongsTo(db.Category, {
    foreignKey: 'parent_id',
    as: 'parent',
});

export default db;
