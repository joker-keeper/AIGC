const express = require('express');
const router = express.Router();
const documentStructureController = require('../controllers/documentStructureController');

// 获取文档结构
router.get('/:documentId/structure', documentStructureController.getDocumentStructure);

// 更新文档结构
router.put('/:documentId/structure', documentStructureController.updateDocumentStructure);

// 删除文档结构
router.delete('/:documentId/structure', documentStructureController.deleteDocumentStructure);

module.exports = router; 