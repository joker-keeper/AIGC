const DocumentStructure = require('../models/DocumentStructure');

// 获取文档结构
exports.getDocumentStructure = async (req, res) => {
    try {
        const { documentId } = req.params;
        const structure = await DocumentStructure.findOne({ documentId });
        
        if (!structure) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到文档结构数据' 
            });
        }

        res.json({
            success: true,
            structure: structure.structure
        });
    } catch (error) {
        console.error('获取文档结构失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '获取文档结构失败' 
        });
    }
};

// 更新或创建文档结构
exports.updateDocumentStructure = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { structure, extractionMethod = 'auto' } = req.body;

        const updatedStructure = await DocumentStructure.findOneAndUpdate(
            { documentId },
            { 
                structure,
                extractionMethod,
                lastUpdated: new Date()
            },
            { 
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            structure: updatedStructure
        });
    } catch (error) {
        console.error('更新文档结构失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '更新文档结构失败' 
        });
    }
};

// 删除文档结构
exports.deleteDocumentStructure = async (req, res) => {
    try {
        const { documentId } = req.params;
        await DocumentStructure.findOneAndDelete({ documentId });
        
        res.json({
            success: true,
            message: '文档结构已删除'
        });
    } catch (error) {
        console.error('删除文档结构失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '删除文档结构失败' 
        });
    }
}; 