const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// const connectDB = require('./config/db');
const documentRoutes = require('./routes/documentRoutes');
const folderRoutes = require('./routes/folderRoutes');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/pdf-manager')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error('Connection error:', err));


const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/folders', folderRoutes);
app.use('/api/documents', documentRoutes);

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});