import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './models/index.js';
import routes from './routes/index.js'; // import routes
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());

// ✅ sau khi khởi tạo app
app.use('/api', routes); // mount tất cả route

// phục vụ ảnh tĩnh (logo brand,...)
// app.use('/uploads', express.static('src/uploads'));

app.use('/uploads', express.static(path.resolve('uploads')));

async function start() {
    try {
        await db.sequelize.authenticate();
        console.log(' Database connected.');

        await db.sequelize.sync({ alter: true });
        console.log('✅Database synced.');

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Unable to connect to the database:', err);
    }
}

start();
