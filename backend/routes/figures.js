// routes/figures.js
const express = require('express');
const router = express.Router();
const Figure = require('../models/Figure');

// 获取文档的图表信息
router.get('/api/documents/:id/figures', async (req, res) => {
  try {
    const documentId = req.params.id;
    console.log(`正在查询文档 ${documentId} 的图表信息`);
    
    const figureData = await Figure.findOne({ documentId });
    console.log('查询结果:', figureData);
    
    if (!figureData) {
      return res.json({ success: true, figures: [] });
    }
    
    res.json({ success: true, figures: figureData.figures });
  } catch (err) {
    console.error('获取图表信息失败:', err);
    res.status(500).json({ success: false, message: '获取图表信息失败' });
  }
});

// 保存文档的图表信息（可选功能）
router.post('/api/documents/:id/figures', async (req, res) => {
  try {
    const documentId = req.params.id;
    const { figures } = req.body;
    
    // 更新或创建
    const result = await Figure.findOneAndUpdate(
      { documentId },
      { documentId, figures },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('保存图表信息失败:', err);
    res.status(500).json({ success: false, message: '保存图表信息失败' });
  }
});

module.exports = router;