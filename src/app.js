import express from 'express';
import cors from 'cors';


const app = express();

// Cho phép frontend (ReactJS) gọi API
app.use(cors({
    origin: 'http://localhost:5173', // hoặc '*' nếu muốn cho tất cả
    credentials: true, // bật nếu frontend có dùng cookie
}));

// Middleware xử lý JSON
app.use(express.json());

// Mount route


export default app;
