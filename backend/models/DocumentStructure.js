const mongoose = require('mongoose');

const bookmarkItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    pageNumber: { type: Number, required: true },
    position: {
        top: Number,
        left: Number
    },
    children: [{ type: mongoose.Schema.Types.Mixed }] // 允许嵌套的目录项
});

const documentStructureSchema = new mongoose.Schema({
    documentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Document', 
        required: true,
        unique: true 
    },
    structure: [bookmarkItemSchema],
    extractionMethod: { 
        type: String, 
        enum: ['auto', 'manual'], 
        default: 'auto' 
    },
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    }
}, { collection: 'documentstructures' }); // 显式指定集合名称

// 添加索引以提高查询性能
documentStructureSchema.index({ documentId: 1 });

module.exports = mongoose.model('DocumentStructure', documentStructureSchema); 