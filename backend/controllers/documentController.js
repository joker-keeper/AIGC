const Document = require('../models/Document');
const Folder = require('../models/Folder');
const fs = require('fs');
const path = require('path');

// 获取文件夹下的文档
exports.getDocumentsByFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.folderId);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const documents = await Document.find({ folderId: req.params.folderId })
      .sort({ uploadDate: -1 });
      
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 上传文档
exports.uploadDocument = async (req, res) => {
  try {
    const { folderId, title, author, description, tags } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
      // 删除已上传的文件
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Folder not found' });
    }

    const document = new Document({
      folderId,
      title,
      author,
      uploadDate: new Date(),
      filePath: req.file.path,
      fileSize: req.file.size,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await document.save();
    
    // 更新文件夹的更新时间
    folder.updatedAt = new Date();
    await folder.save();

    res.status(201).json(document);
  } catch (err) {
    // 出错时删除已上传的文件
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: err.message });
  }
};