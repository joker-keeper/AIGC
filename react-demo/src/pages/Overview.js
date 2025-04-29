import {React, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup, Spinner, Form, Offcanvas, Alert } from 'react-bootstrap';
import Timeline from '../components/Timeline';
import { FolderPlus, Folder, Plus, Upload, Eye } from 'react-bootstrap-icons';
import './Overview.css';
import { getDomains,   createDomain, uploadLiterature, getLiteratures } from '../api/pdfApi';


const Overview = () => {
    
    
    const navigate = useNavigate();
    const [domains, setDomains] = useState([]);
    const [activeDomain, setActiveDomain] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showNewDomainInput, setShowNewDomainInput] = useState(false);
    const [newDomainName, setNewDomainName] = useState('');
    const [literatures, setLiteratures] = useState([]);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [error, setError] = useState('');
    const [file, setFile] = useState(null);



    const test_folders = [
        {
            _id: '1',
            name: '计算美学',
            description: '计算美学研究领域是一种结合计算机科学和美学的交叉学科，它旨在探索计算机技术在艺术创作、设计、人机交互等领域的应用。该领域的研究内容涵盖了计算机图形学、计算机视觉、机器学习、人工智能等多个方面，通过这些技术手段来实现对美的表达、理解和创造。计算美学研究不仅关注艺术表现形式的创新，还涉及到对人类审美心理、文化背景和社会环境等因素的研究，以期在数字化时代推动艺术与科技的融合与发展。'
        }
    ];
    const test_data = {
        research_name: '计算美学',
        research_defination: '计算美学研究领域是一种结合计算机科学和美学的交叉学科，它旨在探索计算机技术在艺术创作、设计、人机交互等领域的应用。该领域的研究内容涵盖了计算机图形学、计算机视觉、机器学习、人工智能等多个方面，通过这些技术手段来实现对美的表达、理解和创造。计算美学研究不仅关注艺术表现形式的创新，还涉及到对人类审美心理、文化背景和社会环境等因素的研究，以期在数字化时代推动艺术与科技的融合与发展。',
        research_scope: [
            "计算机图形学",
            "计算机视觉",
            "机器学习",
            "人工智能"
        ],
        research_application: [
            "艺术创作",
            "设计创新",
            "人机交互",
            "数字媒体"
        ],
        research_hotspot: [
            "生成艺术",
            "智能设计",
            "审美计算",
            "艺术评价"
        ],
        research_timeline: [
            {
                title: '计算美学的起源',
                description: '20世纪60年代，计算机图形学的诞生为计算美学奠定了基础。这一时期，艺术家和计算机科学家开始探索使用计算机进行艺术创作的可能性。',
                date: '1960年代'
            },
            {
                title: '数字艺术的发展',
                description: '20世纪80-90年代，随着个人计算机的普及，数字艺术开始蓬勃发展。这一时期出现了许多重要的数字艺术作品和展览。',
                date: '1980-1990年代'
            },
            {
                title: '人工智能与艺术的结合',
                description: '21世纪初，随着机器学习和深度学习技术的发展，AI开始被广泛应用于艺术创作，产生了许多令人惊叹的作品。',
                date: '2000年代'
            },
            {
                title: '生成艺术的兴起',
                description: '近年来，生成对抗网络(GAN)等技术的出现，使得计算机能够创造出具有高度艺术性的作品，推动了计算美学的新发展。',
                date: '2010年代至今'
            }
        ],
        research_literature: [
            {
                title: '计算美学研究综述',
                authors: ['张三', '李四', '王五'],
                year: '2020',
                journal: '计算机学报',
                abstract: '本文系统综述了计算美学领域的研究进展，包括理论基础、研究方法、应用领域等方面，并对未来发展方向进行了展望。',
                link: '/paper/1'
            },
            {
                title: '人工智能在艺术创作中的应用',
                authors: ['赵六', '钱七', '孙八'],
                year: '2021',
                journal: '人工智能学报',
                abstract: '本文探讨了人工智能技术在艺术创作中的应用，包括生成艺术、风格迁移、智能设计等方面，并分析了其对艺术创作的影响。',
                link: '/paper/2'
            }
        ],
        research_conference: [
            {
                name: '国际计算美学研讨会',
                description: '每年举办一次，汇集全球计算美学领域的研究者。'
            },
            {
                name: '数字艺术与人工智能大会',
                description: '探讨AI在艺术创作中的最新进展和应用。'
            }
        ]
    };

    
    // 获取所有文件夹
    useEffect(() => {
        const fetchDomains = async () => {
            try {
                setLoading(true);
                const { data } = await getDomains();
                setDomains(data);
            } catch (err) {
                setError('获取文件夹失败');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDomains();
    }, []);

    // 添加新文件夹
    const handleAddDomain = async () => {
        if (!newDomainName.trim()) return;

        try {
            setLoading(true);
            const { data } = await createDomain(newDomainName);
            setDomains([...domains, data]);
            setNewDomainName('');
            setShowNewDomainInput(false);
        } catch (err) {
            setError(err.response?.data?.message || '创建文件夹失败');
        } finally {
            setLoading(false);
        }
    };

    // 添加新文献
    const handleAddPaper = async (e) => {
        e.preventDefault();

        if (!file) {
            setError('请选择PDF文件');
            return;
        }

        if (!activeDomain) {
            setError('请先选择文件夹');
            return;
        }

        const data = new FormData();
        data.append('file', file);
        data.append('domainId', activeDomain._id);

        try {
            setLoading(true);
            setError('');
            // 调用后端API上传文献
            await uploadLiterature(data);
            // 上传成功后，更新文献列表
            setShowOffcanvas(false);
            setFile(null);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || '上传失败');
        } finally {
            setLoading(false);
        }
        
    }

    // 获取当前领域所有文献
    useEffect(() => {
        const fetchLiteratures = async () => {
            try {
                setLoading(true);
                const { data } = await getLiteratures(activeDomain._id);
                setLiteratures(data);
                console.log(data);
            } catch (err) {
                setError('获取文献失败');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (activeDomain) {
            fetchLiteratures();
        }
    }, [activeDomain]);
    

    return (
        <>
        <Container fluid className='mt-4'>
        <Row>
            <Col md={2}>
                <Card>
    
                    <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                        <h5 className="mb-0">文档管理</h5>
                        <Button
                            variant="light"
                            size="sm"
                            onClick={() => setShowNewDomainInput(true)}
                            disabled={loading}
                        >
                            <FolderPlus size={18} />
                        </Button>
                    </Card.Header>

                    <ListGroup variant="flush">
                        {showNewDomainInput && (
                            <ListGroup.Item className="d-flex align-items-center p-2">
                                <Folder className="me-2" />
                                <Form.Control
                                    type="text"
                                    size="sm"
                                    placeholder="文件夹名称"
                                    value={newDomainName}
                                    onChange={(e) => setNewDomainName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
                                    autoFocus
                                />
                                <Button
                                    variant="success"
                                    size="sm"
                                    className="ms-2"
                                    onClick={handleAddDomain}
                                    disabled={loading}
                                >
                                    {loading ? '创建中...' : '添加'}
                                </Button>
                            </ListGroup.Item>
                        )}

                        {domains.map((domain) => (
                            <ListGroup.Item
                                key={domain._id}
                                action
                                active={activeDomain?._id === domain._id}
                                onClick={() => setActiveDomain(domain)}
                                className="d-flex align-items-center"
                            >
                                <Folder className="me-2" />
                                {domain.name}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card>
            </Col>
            <Col md={9}>
                <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                        <h5 className="mb-0">
                            {activeDomain ? `研究领域: ${activeDomain.name}` : '请选择文件夹'}
                        </h5>
                        <Button
                            variant="primary"
                            onClick={()=>{setShowOffcanvas(true)}}
                            disabled={!activeDomain || loading}
                        >
                            <Plus className="me-1" /> 添加文献
                        </Button>
                    </Card.Header>
                    <Card.Body>
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                            </div>
                        ) : activeDomain ? (<>
                            <div className="research-overview">
                                {/* 研究领域标题和定义 */}
                                <div className="research-header mb-4">
                                    <h1 className="display-4">{activeDomain.name}</h1>
                                    <p className="lead text-muted">{activeDomain.definition}</p>
                                </div>

                                {/* 研究领域概览卡片 */}
                                <div className="row mb-4">
                                    <div className="col-md-4">
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <h5 className="card-title">研究范围</h5>
                                                <ul className="list-unstyled">
                                                            {activeDomain.scope && activeDomain.scope.map((item, index)=>{
                                                        return <li key={index}>• {item}</li>
                                                    })}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <h5 className="card-title">应用领域</h5>
                                                <ul className="list-unstyled">
                                                    {activeDomain.application && activeDomain.application.map((item, index)=>{
                                                        return <li key={index}>• {item}</li>
                                                    })}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <h5 className="card-title">研究热点</h5>
                                                <ul className="list-unstyled">
                                                    {activeDomain.hotpot && activeDomain.hotpot.map((item, index)=>{
                                                        return <li key={index}>• {item}</li>
                                                    })} 
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 发展历程部分 */}
                                <div className="mb-4">
                                    <h2 className="mb-3">发展历程</h2>
                                    <Timeline events={activeDomain.timeline} />
                                </div>

                                {/* 研究趋势图表 */}
                                <div className="mb-4">
                                    <h2 className="mb-3">研究趋势</h2>
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="research-trend-chart">
                                                {/* 这里可以添加图表组件 */}
                                                <p className="text-center text-muted">研究趋势图表将在这里展示</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 文献数据库 */}
                                <div className="mb-4">
                                    <h2 className="mb-3">文献数据库</h2>
                                    <div className="row">
                                        {literatures && literatures.map((paper, index) => (
                                            <div key={index} className="col-12 mb-4">
                                                <div className="card">
                                                    <div className="card-body">
                                                        <h5 className="card-title">{paper.title}</h5>
                                                        <div className="paper-meta mb-2">
                                                            <span className="badge bg-primary me-2">{paper.year}</span>
                                                            <span className="badge bg-info me-2">{paper.journal}</span>
                                                        </div>
                                                        <p className="card-text text-muted">
                                                            <small>作者：{paper.author}</small>
                                                        </p>
                                                        <p className="card-text">
                                                            <strong>内容概述：</strong>
                                                            {paper.abstract}
                                                        </p>
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => {
                                                                const pdfUrl = `http://localhost:5000/${paper.filePath}`;
                                                                console.log('Navigating to PDF viewer with URL:', pdfUrl);
                                                                navigate('/pdf-viewer', {
                                                                    state: { pdfUrl }
                                                                });
                                                            }}
                                                        >
                                                            <Eye className="me-1" /> 查看
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 学术会议 */}
                                <div className="mb-4">
                                    <h2 className="mb-3">学术会议</h2>
                                    <div className="row">
                                        {activeDomain.conferences && activeDomain.conferences.map((conference, index) => (
                                            <div key={index} className="col-md-6">
                                                <div className="card mb-3">
                                                    <div className="card-body">
                                                        <h5 className="card-title">{conference.name}</h5>
                                                        <p className="card-text">{conference.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>) : (
                            <div className="text-center py-5 text-muted">
                                <Folder size={48} className="mb-3" />
                                <h5>请从左侧选择文件夹</h5>
                                <p>或创建一个新文件夹</p>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
        </Container> 

        <Offcanvas show={showOffcanvas} onHide={()=>{setShowOffcanvas(false);}} placement="end">
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Offcanvas.Header closeButton>
                <Offcanvas.Title>添加文献</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form onSubmit={handleAddPaper}>
                        <Form.Group className="mb-4">
                            <Form.Label>PDF文件 *</Form.Label>
                            <Form.Control
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                                required
                            />
                            <Form.Text className="text-muted">
                                仅支持PDF格式，最大50MB
                            </Form.Text>
                        </Form.Group>

                        <div className="d-grid">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Spinner animation="border" size="sm" />
                                ) : (
                                    <>
                                        <Upload className="me-1" /> 上传文档
                                    </>
                                )}
                            </Button>
                        </div>
                </Form>
            </Offcanvas.Body>
                
        </Offcanvas>
        </>
    );
};

export default Overview;
