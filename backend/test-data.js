const mongoose = require('mongoose');
const Document = require('./models/Document');
const DocumentStructure = require('./models/DocumentStructure');
const fs = require('fs');
const path = require('path');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/pdf-manager')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error('Connection error:', err));

// 生成随机章节数据
const generateRandomStructure = (title) => {
    const chapterCount = Math.floor(Math.random() * 3) + 3; // 3-5章
    const structure = [];
    
    for (let i = 1; i <= chapterCount; i++) {
        const sectionCount = Math.floor(Math.random() * 3) + 2; // 2-4节
        const chapter = {
            title: `第${i}章 ${title}相关内容${i}`,
            pageNumber: i * 2 - 1,
            position: { top: 100, left: 50 },
            children: []
        };
        
        for (let j = 1; j <= sectionCount; j++) {
            chapter.children.push({
                title: `${i}.${j} 小节内容${j}`,
                pageNumber: i * 2 - 1 + Math.floor((j - 1) / 2),
                position: { top: 150 + j * 50, left: 50 }
            });
        }
        
        structure.push(chapter);
    }
    
    return structure;
};

// 检查文件是否存在
const checkFileExists = async (filePath) => {
    const fullPath = path.join(__dirname, filePath);
    try {
        await fs.promises.access(fullPath);
        return true;
    } catch {
        return false;
    }
};

// 测试数据
const createTestData = async () => {
    try {
        // 清空现有的文档结构数据
        await DocumentStructure.deleteMany({});
        console.log('已清空现有文档结构数据');

        // 获取所有现有文档
        const documents = await Document.find({});
        console.log(`找到 ${documents.length} 个文档，开始创建结构数据...`);

        // 为每个文档创建结构
        for (const doc of documents) {
            console.log(`\n处理文档: "${doc.title}" (ID: ${doc._id})`);
            
            // 检查PDF文件是否存在
            const fileExists = await checkFileExists(doc.filePath);
            console.log(`文件路径: ${doc.filePath}`);
            console.log(`文件${fileExists ? '存在' : '不存在'}`);

            const documentStructure = await DocumentStructure.create({
                documentId: doc._id,
                structure: generateRandomStructure(doc.title),
                extractionMethod: 'manual',
                lastUpdated: new Date()
            });

            console.log('结构数据创建成功');
            console.log('结构ID:', documentStructure._id);
            console.log('----------------------------------------');
        }

        // 验证数据是否正确保存
        const structureCount = await DocumentStructure.countDocuments();
        console.log(`\n验证：documentstructures 集合中共有 ${structureCount} 条记录`);

        console.log('\n所有文档结构创建完成！');
        console.log('\n测试URL示例:');
        if (documents.length > 0) {
            const doc = documents[0];
            console.log(`文档信息：`);
            console.log(`- 标题: ${doc.title}`);
            console.log(`- ID: ${doc._id}`);
            console.log(`- 文件路径: ${doc.filePath}`);
            console.log(`\n测试URL: http://localhost:3000/pdf-viewer?id=${doc._id}`);
        }

    } catch (error) {
        console.error('创建测试数据失败:', error);
    } finally {
        // 断开数据库连接
        await mongoose.disconnect();
    }
};

// 运行测试数据创建
createTestData(); 