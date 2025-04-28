const mongoose = require('mongoose');
const Figure = require('./models/Figure');
const fs = require('fs');
const path = require('path');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/pdf-manager')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error('Connection error:', err));

const insertFigures = async () => {
  try {
    // 读取测试数据文件
    const filePath = path.join(__dirname, 'test_figures.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const figureData = JSON.parse(jsonData);
    
    console.log('读取到的图表数据:', figureData);
    console.log('文档ID:', figureData.documentId);
    console.log('图表数量:', figureData.figures.length);
    
    // 先检查是否已存在该文档的图表数据
    const existingData = await Figure.findOne({ documentId: figureData.documentId });
    
    if (existingData) {
      console.log('已存在该文档的图表数据，进行更新...');
      await Figure.findOneAndUpdate(
        { documentId: figureData.documentId },
        figureData
      );
      console.log('图表数据更新成功!');
    } else {
      console.log('创建新的图表数据...');
      await Figure.create(figureData);
      console.log('图表数据插入成功!');
    }
    
    // 验证插入结果
    const result = await Figure.findOne({ documentId: figureData.documentId });
    console.log('验证结果 - 文档ID:', result.documentId);
    console.log('验证结果 - 图表数量:', result.figures.length);
    
  } catch (error) {
    console.error('插入图表数据失败:', error);
  } finally {
    // 断开数据库连接
    console.log('关闭数据库连接...');
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
};

console.log('开始执行图表数据插入...');
insertFigures(); 