// react-demo/src/components/PdfViewer/PDFViewer.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Nav, Tab, Button, Card, Spinner } from 'react-bootstrap';
import { XLg, Search, Translate, X } from 'react-bootstrap-icons';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import './style.css';

// 模拟翻译API
const translateAPI = async (text) => {
    // 这里替换为实际的翻译API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        translatedText: `翻译结果: ${text}`
    };
};

// 模拟搜索API
const searchAPI = async (text) => {
    // 这里替换为实际的搜索API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        searchResults: `搜索结果: 关于"${text}"的解释...`
    };
};

// 选择工具栏组件
const SelectionToolbar = ({ position, onTranslate, onSearch, onClose }) => {
    return (
        <div 
            className="selection-toolbar"
            style={{
                left: position.x,
                top: position.y
            }}
        >
            <Button 
                size="sm" 
                variant="light"
                className="toolbar-btn"
                onClick={onTranslate}
            >
                <Translate /> 翻译
            </Button>
            <Button 
                size="sm" 
                variant="light"
                className="toolbar-btn"
                onClick={onSearch}
            >
                <Search /> 搜索
            </Button>
        </div>
    );
};

// 结果卡片组件
const ResultCard = ({ position, content, loading, onClose }) => {
    return (
        <Card 
            className="result-card" 
            style={{ 
                left: position.x,
                top: position.y + 40 // 在工具栏下方显示
            }}
        >
            <Card.Header className="d-flex justify-content-between align-items-center py-2">
                <span>查询结果</span>
                <Button 
                    size="sm" 
                    variant="link" 
                    className="p-0 text-muted" 
                    onClick={onClose}
                >
                    <X />
                </Button>
            </Card.Header>
            <Card.Body className="py-2">
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" size="sm" />
                    </div>
                ) : (
                    <div className="result-content">
                        {content}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

const PDFViewer = () => {
    const location = useLocation();
    const pdfUrl = location.state?.pdfUrl;
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const [activeTab, setActiveTab] = useState('summary');
    const [selectedText, setSelectedText] = useState(null);
    const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState(null);

    const handleTextSelection = (event) => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        if (text) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // 计算工具栏位置，使其显示在选中文本的上方
            setSelectedText(text);
            setToolbarPosition({
                x: rect.left + (rect.width / 2) - 50, // 居中显示，50是工具栏宽度的一半
                y: rect.top - 40 // 显示在文本上方
            });
            setSearchResult(null); // 清除之前的搜索结果
        } else {
            // 如果没有选中文本，并且点击在卡片外部，则清除所有状态
            const clickedElement = event.target;
            const isClickedOutside = !document.querySelector('.selection-toolbar')?.contains(clickedElement) &&
                                   !document.querySelector('.result-card')?.contains(clickedElement);
            
            if (isClickedOutside) {
                handleCloseAll();
            }
        }
    };

    const handleCloseAll = () => {
        setSelectedText(null);
        setSearchResult(null);
    };

    const handleTranslate = async () => {
        setLoading(true);
        try {
            const response = await translateAPI(selectedText);
            setSearchResult(response.translatedText);
        } catch (error) {
            console.error('翻译失败:', error);
            setSearchResult('翻译失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await searchAPI(selectedText);
            setSearchResult(response.searchResults);
        } catch (error) {
            console.error('搜索失败:', error);
            setSearchResult('搜索失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    if (!pdfUrl) {
        return <div className="pdf-error">未找到PDF文件</div>;
    }

    return (
        <div className="pdf-container">
            <div className="pdf-header">
                <h5 className="pdf-title">文档查看器</h5>
                <Button variant="outline-secondary" size="sm" onClick={() => window.history.back()}>
                    <XLg /> 关闭
                </Button>
            </div>
            
            <div className="pdf-content">
                <div 
                    className="pdf-viewer-container"
                    onMouseUp={handleTextSelection}
                >
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <div className="pdf-viewer">
                            <Viewer
                                fileUrl={pdfUrl}
                                plugins={[defaultLayoutPluginInstance]}
                            />
                        </div>
                    </Worker>
                    
                    {selectedText && (
                        <SelectionToolbar
                            position={toolbarPosition}
                            onTranslate={handleTranslate}
                            onSearch={handleSearch}
                            onClose={handleCloseAll}
                        />
                    )}
                    
                    {searchResult && (
                        <ResultCard
                            position={toolbarPosition}
                            content={searchResult}
                            loading={loading}
                            onClose={handleCloseAll}
                        />
                    )}
                </div>

                <div className="pdf-sidebar">
                    <Nav variant="tabs" className="pdf-sidebar-nav">
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'summary'}
                                onClick={() => setActiveTab('summary')}
                            >
                                总结
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'charts'}
                                onClick={() => setActiveTab('charts')}
                            >
                                图表
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'mindmap'}
                                onClick={() => setActiveTab('mindmap')}
                            >
                                脑图
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                    
                    <div className="pdf-sidebar-content">
                        <Tab.Content>
                            <Tab.Pane active={activeTab === 'summary'}>
                                <div className="p-3">
                                    <h6>文档总结</h6>
                                    <p>这里显示文档的总结内容...</p>
                                </div>
                            </Tab.Pane>
                            <Tab.Pane active={activeTab === 'charts'}>
                                <div className="p-3">
                                    <h6>图表分析</h6>
                                    <p>这里显示文档的图表分析...</p>
                                </div>
                            </Tab.Pane>
                            <Tab.Pane active={activeTab === 'mindmap'}>
                                <div className="p-3">
                                    <h6>知识脑图</h6>
                                    <p>这里显示文档的知识脑图...</p>
                                </div>
                            </Tab.Pane>
                        </Tab.Content>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PDFViewer;