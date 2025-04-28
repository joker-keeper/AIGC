import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, ListGroup, Form, Table, Spinner, Alert } from 'react-bootstrap';
import { Plus, FileEarmark, Folder, FolderPlus, Eye } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { getFolders, createFolder, getDocuments, uploadDocument } from '../api/pdfApi';

const UploadPage = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取所有文件夹
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoading(true);
        const { data } = await getFolders();
        setFolders(data);
      } catch (err) {
        setError('获取文件夹失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFolders();
  }, []);

  // 获取当前文件夹下的文档
  useEffect(() => {
    if (activeFolder?._id) {
      const fetchDocuments = async () => {
        try {
          setLoading(true);
          const { data } = await getDocuments(activeFolder._id);
          setDocuments(data);
        } catch (err) {
          setError('获取文档失败');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDocuments();
    }
  }, [activeFolder]);

  // 添加新文件夹
  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      setLoading(true);
      const { data } = await createFolder(newFolderName);
      setFolders([...folders, data]);
      setNewFolderName('');
      setShowNewFolderInput(false);
    } catch (err) {
      setError(err.response?.data?.message || '创建文件夹失败');
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container fluid className="mt-4">
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      
      <Row>
        {/* 左侧文件夹导航 */}
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
              <h5 className="mb-0">文档管理</h5>
              <Button 
                variant="light" 
                size="sm" 
                onClick={() => setShowNewFolderInput(true)}
                disabled={loading}
              >
                <FolderPlus size={18} />
              </Button>
            </Card.Header>
            
            <ListGroup variant="flush">
              {showNewFolderInput && (
                <ListGroup.Item className="d-flex align-items-center p-2">
                  <Folder className="me-2" />
                  <Form.Control
                    type="text"
                    size="sm"
                    placeholder="文件夹名称"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddFolder()}
                    autoFocus
                  />
                  <Button 
                    variant="success" 
                    size="sm" 
                    className="ms-2" 
                    onClick={handleAddFolder}
                    disabled={loading}
                  >
                    {loading ? '创建中...' : '添加'}
                  </Button>
                </ListGroup.Item>
              )}

              {folders.map((folder) => (
                <ListGroup.Item 
                  key={folder._id}
                  action
                  active={activeFolder?._id === folder._id}
                  onClick={() => setActiveFolder(folder)}
                  className="d-flex align-items-center"
                >
                  <Folder className="me-2" />
                  {folder.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        {/* 右侧文档列表 */}
        <Col md={9}>
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
              <h5 className="mb-0">
                {activeFolder ? `文件夹: ${activeFolder.name}` : '请选择文件夹'}
              </h5>
              <Button 
                variant="primary" 
                onClick={() => navigate('/upload-form', { state: { folderId: activeFolder?._id } })}
                disabled={!activeFolder || loading}
              >
                <Plus className="me-1" /> 添加文档
              </Button>
            </Card.Header>

            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : activeFolder ? (
                documents.length > 0 ? (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>标题</th>
                        <th>作者</th>
                        <th>上传日期</th>
                        <th>大小</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc._id}>
                          <td>{doc.title}</td>
                          <td>{doc.author}</td>
                          <td>{formatDate(doc.uploadDate)}</td>
                          <td>{formatFileSize(doc.fileSize)}</td>
                          <td>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                const pdfUrl = `http://localhost:5000/${doc.filePath}`;
                                console.log('Document details:', {
                                    id: doc._id,
                                    url: pdfUrl,
                                    path: doc.filePath
                                });
                                const targetUrl = `/pdf-viewer?id=${doc._id}`;
                                console.log('Target URL:', targetUrl);
                                navigate(targetUrl, {
                                    state: { pdfUrl }
                                });
                            }}
                          >
                              <Eye className="me-1" /> 查看
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <FileEarmark size={48} className="mb-3" />
                    <h5>该文件夹暂无文档</h5>
                    <p>点击"添加文档"按钮上传文件</p>
                  </div>
                )
              ) : (
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
  );
};

export default UploadPage;