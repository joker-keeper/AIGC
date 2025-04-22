import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { ArrowLeft, Upload } from 'react-bootstrap-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { uploadDocument } from '../api/pdfApi';

const UploadForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const folderId = state?.folderId;

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    tags: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('请选择PDF文件');
      return;
    }
    
    if (!folderId) {
      setError('请先选择文件夹');
      return;
    }

    const data = new FormData();
    data.append('file', file);
    data.append('folderId', folderId);
    data.append('title', formData.title);
    data.append('author', formData.author);
    data.append('description', formData.description);
    data.append('tags', formData.tags);

    try {
      setLoading(true);
      setError('');
      await uploadDocument(data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || '上传失败');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container className="mt-4">
        <Alert variant="success" className="text-center">
          <h4>上传成功!</h4>
          <p className="mb-4">文档已成功添加到系统</p>
          <Button 
            variant="success" 
            onClick={() => navigate('/upload')}
          >
            返回文档列表
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Button 
        variant="outline-secondary" 
        onClick={() => navigate(-1)}
        className="mb-3"
        disabled={loading}
      >
        <ArrowLeft className="me-1" /> 返回
      </Button>

      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <h5>上传新文档</h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>文档标题 *</Form.Label>
              <Form.Control 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>作者 *</Form.Label>
              <Form.Control 
                type="text" 
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>描述</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>标签 (用逗号分隔)</Form.Label>
              <Form.Control 
                type="text" 
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="例如: 深度学习,图像分类,CNN"
              />
            </Form.Group>

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
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UploadForm;