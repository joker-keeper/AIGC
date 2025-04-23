// react-demo/src/components/PdfViewer/PDFViewer.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Nav, Tab, Button } from 'react-bootstrap';
import { XLg } from 'react-bootstrap-icons';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import './style.css';

const PDFViewer = () => {
    const location = useLocation();
    const pdfUrl = location.state?.pdfUrl;
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const [activeTab, setActiveTab] = useState('summary');

    if (!pdfUrl) {
        return <div className="pdf-error">未找到PDF文件</div>;
    }

    return (
        <div className="pdf-container">
            {/* 顶部栏 */}
            <div className="pdf-header">
                <h5 className="pdf-title">文档查看器</h5>
                <Button variant="outline-secondary" size="sm" onClick={() => window.history.back()}>
                    <XLg /> 关闭
                </Button>
            </div>
            
            <div className="pdf-content">
                {/* PDF查看区域 */}
                <div className="pdf-viewer-container">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <div className="pdf-viewer">
                            <Viewer
                                fileUrl={pdfUrl}
                                plugins={[defaultLayoutPluginInstance]}
                            />
                        </div>
                    </Worker>
                </div>

                {/* 右侧功能面板 */}
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