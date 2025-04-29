const Domain = require('../models/Domain');
const Literature = require('../models/Literature');
const { syncLanxingpt } = require('../middlewares/lanxinApi');
const fs = require('fs');
// 获取所有领域
exports.getAllDoamins = async (req, res) => {
    try {
        const domains = await Domain.find().sort({ createdAt: -1 });
        res.json(domains);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 更新领域信息
async function syncDomain(domain){

    const name = domain.name;

    await syncLanxingpt(`请输出一段连续的文字来介绍${name}研究领域的定义，不分段`).then((res) => {
        // Domain.updateOne({name: name}, {$set: {definition: res}});
        domain.definition = res;
        domain.save();
    });

    await syncLanxingpt(`请输出${name}领域的主要研究范围。输出格式为：词组1;词组2;词组3 ，其中分号为半角格式，词组数量不超过5个`).then((res) => {
        const data = res;
        const scope = data.split(';');
        // Domain.updateOne({name: domain.name}, {$set: {scope: scope}});
        domain.scope = scope;
        domain.save();
    })

    await syncLanxingpt(`请输出${name}领域的主要应用领域。输出格式为：词组1;词组2;词组3 ，其中分号为半角格式，词组数量不超过5个`).then((res) => {
        const data = res;
        const application = data.split(';');
        // Domain.updateOne({ name: domain.name }, {$set: {application: application}});
        domain.application = application;
        domain.save();
    })

    await syncLanxingpt(`请输出${name}领域的主要研究热点。输出格式为：词组1;词组2;词组3 ，其中分号为半角格式，词组数量不超过5个`).then((res) => {
        const data = res;
        const hotpot = data.split(';');
        // Domain.updateOne({ name: domain.name }, {$set: {hotpot: hotpot}});
        domain.hotpot = hotpot;
        domain.save();
    })

    await syncLanxingpt(`请输出${name}领域的发展历程，输出信息包括时间、标题和描述。输出格式为 \`时间: 标题: 描述\`，其中冒号为半角格式。`).then((res) => {
        const data = res;
        const timeline = data.split('\n');
        const timelineList = timeline.map(item => {
            const [date, name, description] = item.split(/:|：/);
            // console.log([date,name,description])
            if (date && name && description) {
                return {
                    date: date.trim(),
                    name: name.trim(),
                    description: description.trim()
                };
            }
        });
        // Domain.updateOne({ name: domain.name }, {$set: {timeline: timelineList}});
        domain.timeline = timelineList.filter(item => item !== null && item !== undefined);
        domain.save();
    })

    await syncLanxingpt(`请输出${name}领域的主要学术会议，输出信息包括会议名称和会议描述。输出格式为\`会议名称: 会议描述\`，其中冒号为半角格式。`).then((res) => {
        const data = res;
        const conferences = data.split('\n');
        const conferenceList = conferences.map(conference => {
            const [name, description] = conference.split(/:|：/);
            // console.log([name, description])
            if (name && description) {
                return {
                    name: name.trim(),
                    description: description.trim()
                };
            }
        });
        // Domain.updateOne({ name: domain.name }, {$set: {conferences: conferenceList}});
        domain.conferences = conferenceList.filter(item => item !== null && item !== undefined);
        domain.save();
    })

}

// 创建新领域
exports.createDomain = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Folder name is required' });
        }

        const existingDomain = await Domain.findOne({ name });
        if (existingDomain) {
            return res.status(400).json({ message: 'Folder already exists' });
        }

        const domain = new Domain({ name });
        await domain.save();

        syncDomain(domain);

        res.status(201).json(domain);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 上传文档
exports.uploadLiterature = async (req, res) => {
    try {
        const { domainId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const domain = await Domain.findById(domainId);
        if (!domain) {
            // 删除已上传的文件
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Domain not found' });
        }

        const literature = new Literature({
            domainId,
            uploadDate: new Date(),
            filePath: req.file.path,
            fileSize: req.file.size,
            title: req.file.path.split('\\').pop().split('.')[0]
        });

        await literature.save();

        // 更新文件夹的更新时间
        domain.updatedAt = new Date();
        await domain.save();

        res.status(201).json(literature);
    } catch (err) {
        // 出错时删除已上传的文件
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: err.message });
    }
};

// 获取领域的文献
exports.getLiteraturesByFolder = async (req, res) => {
    try {
        const domain = await Domain.findById(req.params.domainId);
        if (!domain) {
            return res.status(404).json({ message: 'Domain not found' });
        }

        const literatures = await Literature.find({ domainId: req.params.domainId })
            .sort({ uploadDate: -1 });

        res.json(literatures);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};