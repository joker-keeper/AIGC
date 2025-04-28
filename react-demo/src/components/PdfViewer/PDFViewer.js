// react-demo/src/components/PdfViewer/PDFViewer.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { scrollModePlugin } from '@react-pdf-viewer/scroll-mode';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { Nav, Tab, Button, Card, Spinner } from 'react-bootstrap';
import { XLg, Search, Translate, X, List, ChevronDown, ChevronRight } from 'react-bootstrap-icons';
import axios from 'axios';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import './style.css';

// 配置pdfjs worker
// 直接使用public目录中的worker文件

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

// 目录树组件
const BookmarkTree = ({ items, onItemClick, expandedNodes, setExpandedNodes, currentPage }) => {
    const toggleNode = (nodeId) => {
        setExpandedNodes(prev => {
            if (prev.includes(nodeId)) {
                return prev.filter(id => id !== nodeId);
            }
            return [...prev, nodeId];
        });
    };

    return (
        <ul className="bookmark-tree">
            {items.map((item, index) => (
                <li key={index}>
                    <div className="bookmark-item">
                        {item.children && item.children.length > 0 && (
                            <Button 
                                variant="link" 
                                className="toggle-btn"
                                onClick={() => toggleNode(index)}
                            >
                                {expandedNodes.includes(index) ? (
                                    <ChevronDown size={12} />
                                ) : (
                                    <ChevronRight size={12} />
                                )}
                            </Button>
                        )}
                        <span 
                            className={`bookmark-title ${item.pageNumber === currentPage ? 'active' : ''}`}
                            onClick={() => onItemClick(item)}
                            style={{ 
                                marginLeft: item.children && item.children.length > 0 ? 0 : '20px',
                                cursor: 'pointer'
                            }}
                            title={`跳转到第${item.pageNumber}页: ${item.title}`}
                        >
                            {item.title}
                        </span>
                    </div>
                    {item.children && item.children.length > 0 && expandedNodes.includes(index) && (
                        <BookmarkTree 
                            items={item.children}
                            onItemClick={onItemClick}
                            expandedNodes={expandedNodes}
                            setExpandedNodes={setExpandedNodes}
                            currentPage={currentPage}
                        />
                    )}
                </li>
            ))}
        </ul>
    );
};

const PDFViewer = () => {
    const location = useLocation();
    const [pdfUrl, setPdfUrl] = useState(location.state?.pdfUrl);
    const scrollModePluginInstance = scrollModePlugin();
    const pageNavigationPluginInstance = pageNavigationPlugin();
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) => [
            ...defaultTabs,
        ],
    });
    const [showSidebar, setShowSidebar] = useState(false);
    const [activeTab, setActiveTab] = useState('bookmark');
    const [selectedText, setSelectedText] = useState(null);
    const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [documentStructure, setDocumentStructure] = useState(null);
    const [expandedNodes, setExpandedNodes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [structureLoading, setStructureLoading] = useState(false);
    const [figures, setFigures] = useState([]);
    const [figuresLoading, setFiguresLoading] = useState(false);
    const [docId, setDocId] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const viewerRef = useRef(null);
    const pdfViewerContainerRef = useRef(null);
    
    // 添加一个状态来手动触发页面跳转
    const [forcePage, setForcePage] = useState(null);
    
    // 添加状态来跟踪当前处理的跳转操作
    const [pendingJump, setPendingJump] = useState(null);
    
    // 创建一个包装过的跳转函数
    const jumpToPageSafe = useCallback((pageIndex) => {
        console.log(`安全跳转到页面 ${pageIndex + 1}`);
        // 使用状态触发跳转
        setForcePage(pageIndex);
    }, []);
    
    // 监听forcePage变化，执行页面跳转
    useEffect(() => {
        if (forcePage !== null) {
            console.log(`通过状态强制跳转到页面 ${forcePage + 1}`);
            
            try {
                // 先尝试使用viewerRef
                if (viewerRef.current && typeof viewerRef.current.setPage === 'function') {
                    console.log('使用viewerRef跳转');
                    viewerRef.current.setPage(forcePage);
                } 
                // 再尝试使用window上存储的插件API
                else if (window.pdfJumpToPage && typeof window.pdfJumpToPage === 'function') {
                    console.log('使用pdfJumpToPage跳转');
                    window.pdfJumpToPage(forcePage);
                }
                // 最后尝试DOM方法
                else {
                    console.log('使用DOM方法寻找跳转机制');
                    
                    // 方法1: 页面按钮模拟点击
                    const pageButtons = document.querySelectorAll('.rpv-core__page-layer-button');
                    if (pageButtons && pageButtons.length > forcePage) {
                        console.log('找到页面按钮，模拟点击');
                        pageButtons[forcePage].click();
                    } 
                    // 方法2: 查找页面元素并滚动到视图
                    else {
                        console.log('尝试查找页面元素并滚动到视图');
                        // 查找特定页码的页面元素
                        const pageElements = document.querySelectorAll('.rpv-core__page');
                        if (pageElements && pageElements.length > forcePage) {
                            console.log(`找到页面${forcePage + 1}元素，滚动到视图`);
                            pageElements[forcePage].scrollIntoView({ behavior: 'smooth' });
                        }
                        // 方法3: 通过页面索引查找页面
                        else {
                            const specificPageElement = document.querySelector(`.rpv-core__page[data-page-number="${forcePage}"], .rpv-core__page[data-page-index="${forcePage}"]`);
                            if (specificPageElement) {
                                console.log(`通过索引找到页面${forcePage + 1}元素，滚动到视图`);
                                specificPageElement.scrollIntoView({ behavior: 'smooth' });
                            }
                            // 方法4: 自定义分发事件
                            else {
                                console.log('分发自定义跳转事件');
                                document.dispatchEvent(new CustomEvent('pdf-jump-page', { 
                                    detail: { pageIndex: forcePage } 
                                }));
                            }
                        }
                    }
                    
                    // 记录当前页码，以便检查跳转是否成功
                    setTimeout(() => {
                        setCurrentPage(forcePage + 1);
                    }, 500);
                }
            } catch (error) {
                console.error('状态触发跳转失败:', error);
            }
            
            // 重置状态
            setTimeout(() => {
                setForcePage(null);
            }, 100);
        }
    }, [forcePage]);

    // 获取文档ID和PDF URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        setDocId(id);
        
        console.log('Document ID from URL:', id);
        console.log('Initial PDF URL from state:', pdfUrl);
        
        // 如果没有pdfUrl，则根据docId获取
        if (id && !pdfUrl) {
            setLoadingPdf(true);
            console.log('Fetching document details to get PDF URL');
            
            axios.get(`http://localhost:5000/api/documents/${id}`)
                .then(res => {
                    if (res.data && res.data.filePath) {
                        const url = `http://localhost:5000/${res.data.filePath}`;
                        console.log('Retrieved PDF URL:', url);
                        setPdfUrl(url);
                    } else {
                        console.error('Document API response does not contain filePath:', res.data);
                    }
                })
                .catch(err => {
                    console.error('Error fetching document details:', err);
                })
                .finally(() => {
                    setLoadingPdf(false);
                });
        }
    }, [location, pdfUrl]);

    // 获取文档结构
    useEffect(() => {
        if (!docId) return;
        
        const fetchDocumentStructure = async () => {
            try {
                setStructureLoading(true);
                // 调用API获取文档结构
                const apiUrl = `http://localhost:5000/api/documents/${docId}/structure`;
                console.log('Fetching structure from:', apiUrl);
                
                const response = await axios.get(apiUrl);
                console.log('API Response:', response.data);
                
                if (response.data.success && response.data.structure) {
                    console.log('Setting document structure:', response.data.structure);
                    setDocumentStructure(response.data.structure);
                    setExpandedNodes([0]); // 展开第一章
                } else {
                    console.log('No structure data in response');
                }
            } catch (error) {
                console.error('获取文档结构失败:', error);
            } finally {
                setStructureLoading(false);
            }
        };

        fetchDocumentStructure();
    }, [docId]);  // 依赖docId而不是整个location

    // 获取图表数据
    useEffect(() => {
        if (activeTab === 'charts' && docId) {
            const fetchFigures = async () => {
                setFiguresLoading(true);
                try {
                    console.log('Fetching figures for document:', docId);
                    const res = await axios.get(`http://localhost:5000/api/documents/${docId}/figures`);
                    console.log('Figures API response:', res.data);
                    setFigures(res.data.figures || []);
                } catch (e) {
                    console.error('获取图表数据失败:', e);
                    setFigures([]);
                } finally {
                    setFiguresLoading(false);
                }
            };
            fetchFigures();
        }
    }, [activeTab, docId]);

    // 在useEffect中添加一个专门用于检查和初始化viewerRef的钩子
    useEffect(() => {
        // 检查viewerRef是否正确初始化
        console.log('检查viewerRef初始化状态:', viewerRef.current);
        
        // 如果PDF已加载但viewerRef未初始化，尝试主动查找并绑定
        if (pdfUrl && !viewerRef.current) {
            console.log('尝试手动初始化viewerRef');
            // 延迟执行，确保DOM已经渲染
            const initTimer = setTimeout(() => {
                // 尝试通过DOM查找viewer实例
                const viewerInstance = document.querySelector('.rpv-core__viewer-container');
                if (viewerInstance) {
                    console.log('找到viewer实例，尝试绑定');
                    // 在控制台输出实例信息，帮助调试
                    console.log('Viewer实例:', viewerInstance);
                }
            }, 1000);
            
            return () => clearTimeout(initTimer);
        }
    }, [pdfUrl, viewerRef.current]);

    // 添加一个函数用于可靠地获取滚动容器
    const getScrollContainer = (retryCount = 0, maxRetries = 10) => {
        return new Promise((resolve, reject) => {
            // 尝试多种选择器
            const selectors = [
                '.rpv-core__viewer-container',
                '.rpv-core__doc-container',
                '.rpv-core__inner-pages',
                '.rpv-core__inner-page',
                '.rpv-core__viewer',
                '.pdf-viewer',
                '.pdf-viewer-container',
                '[role="presentation"]',
                '.rpv-core__primary-scrollable',
                '.rpv-core__scrollable'
            ];
            
            // 尝试找到任何一个容器
            for (const selector of selectors) {
                const container = document.querySelector(selector);
                if (container && (typeof container.scrollTo === 'function' || 'scrollTop' in container)) {
                    console.log(`找到可滚动容器: ${selector}`, container);
                    return resolve(container);
                }
            }
            
            // 如果未找到，且未达到最大重试次数，则延迟重试
            if (retryCount < maxRetries) {
                console.log(`未找到滚动容器，${100 * (retryCount + 1)}ms后重试 (${retryCount + 1}/${maxRetries})`);
                setTimeout(() => {
                    getScrollContainer(retryCount + 1, maxRetries)
                        .then(resolve)
                        .catch(reject);
                }, 100 * (retryCount + 1)); // 逐渐增加延迟时间
            } else {
                console.error(`在${maxRetries}次尝试后仍未找到滚动容器`);
                reject(new Error('未能找到滚动容器'));
            }
        });
    };
    
    // 修改滚动到位置的函数，根据页面动态计算位置
    const scrollToPosition = (position, isHighlight = true, pageIndex = null) => {
        if (!position || typeof position.top !== 'number') {
            console.log('无效的位置信息');
            return;
        }
        
        console.log(`尝试滚动到位置: top=${position.top}, left=${position.left || 0}, 页码=${pageIndex !== null ? pageIndex + 1 : '当前页'}`);
        
        // 使用获取容器的Promise
        getScrollContainer()
            .then(container => {
                console.log('成功获取滚动容器，执行滚动');
                
                // 尝试计算当前页面的实际位置
                let actualPosition = position.top;
                
                // 如果提供了页码，尝试计算该页的绝对位置
                if (pageIndex !== null) {
                    // 获取该页的页面元素
                    const pageElement = document.querySelector(`.rpv-core__page[data-page-number="${pageIndex}"], .rpv-core__page[data-page-index="${pageIndex}"]`);
                    
                    if (pageElement) {
                        // 获取页面元素的绝对位置
                        const pageTop = pageElement.offsetTop;
                        console.log(`找到页面${pageIndex + 1}元素，页面顶部位置: ${pageTop}px`);
                        
                        // 计算页面内相对位置
                        actualPosition = pageTop + position.top;
                        console.log(`计算的绝对位置: ${actualPosition}px (页面顶部 ${pageTop} + 相对位置 ${position.top})`);
                    } else {
                        console.log(`未找到页面${pageIndex + 1}元素，使用原始位置值`);
                    }
                }
                
                try {
                    // 尝试使用scrollTo滚动到计算后的位置
                    console.log(`滚动到计算后的位置: ${actualPosition}px`);
                    container.scrollTo({
                        top: actualPosition,
                        behavior: 'smooth'
                    });
                    
                    // 200ms后检查滚动是否成功
                    setTimeout(() => {
                        console.log(`当前滚动位置: ${container.scrollTop}, 目标位置: ${actualPosition}`);
                        
                        // 如果滚动不准确，使用scrollTop直接设置
                        if (Math.abs(container.scrollTop - actualPosition) > 100) {
                            console.log('滚动可能不准确，使用直接设置');
                            container.scrollTop = actualPosition;
                        }
                        
                        // 添加高亮效果
                        if (isHighlight) {
                            addHighlightAtPosition({
                                top: container.scrollTop + 50, // 相对当前视图顶部往下50px
                                left: position.left || 50
                            });
                        }
                    }, 300);
                } catch (error) {
                    console.error('滚动失败，使用备选方法:', error);
                    // 直接设置scrollTop
                    container.scrollTop = actualPosition;
                    
                    // 添加高亮效果
                    if (isHighlight) {
                        addHighlightAtPosition({
                            top: container.scrollTop + 50,
                            left: position.left || 50
                        });
                    }
                }
            })
            .catch(error => {
                console.error('无法获取滚动容器:', error);
            });
    };

    // 创建一个完全分离的两步跳转函数
    const jumpAndScroll = (pageNumber, position = null) => {
        console.log(`启动两步跳转: 页码=${pageNumber}, 位置=`, position);
        
        // 第一步: 存储跳转意图
        setPendingJump({
            pageNumber,
            position,
            timestamp: Date.now() // 添加时间戳，避免处理旧请求
        });
        
        // 页码从0开始计数
        const pageIndex = pageNumber - 1;
        
        // 使用强制状态变更触发页面跳转
        setForcePage(pageIndex);
    };
    
    // 处理页面跳转完成后的滚动操作
    useEffect(() => {
        // 如果有待处理的跳转，且forcePage为null (表示页面跳转已处理完毕)
        if (pendingJump && forcePage === null) {
            const { pageNumber, position, timestamp } = pendingJump;
            
            // 如果跳转请求已经超过5秒，丢弃
            if (Date.now() - timestamp > 5000) {
                console.log('跳转请求已过期，丢弃');
                setPendingJump(null);
                return;
            }
            
            console.log(`执行跳转第二阶段: 页码=${pageNumber}, 位置=`, position);
            
            // 如果没有位置信息，直接清除待处理跳转
            if (!position || typeof position.top !== 'number') {
                console.log('无位置信息，跳转完成');
                setPendingJump(null);
                return;
            }
            
            // 给页面足够时间加载和渲染
            const scrollTimeout = setTimeout(() => {
                console.log(`准备滚动到页码${pageNumber}的位置:`, position);
                
                // 尝试检查DOM结构，输出所有可能的选择器
                console.log("==== PDF 查看器 DOM 结构 ====");
                const selectors = [
                    '.rpv-core__viewer-container',
                    '.rpv-core__inner-pages',
                    '.rpv-core__doc-container',
                    '.rpv-core__page',
                    '.rpv-core__page-layer',
                    '.rpv-core__viewer',
                    '.pdf-viewer',
                    '.pdf-viewer-container',
                    '[role="presentation"]'
                ];
                
                selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        console.log(`找到 ${elements.length} 个 ${selector} 元素`);
                        if (elements.length < 10) {
                            Array.from(elements).forEach((el, idx) => {
                                const attrs = Array.from(el.attributes).map(a => `${a.name}="${a.value}"`).join(' ');
                                console.log(`- ${selector}[${idx}]: <${el.tagName} ${attrs}>`);
                            });
                        }
                    } else {
                        console.log(`没有找到 ${selector} 元素`);
                    }
                });
                
                // 寻找PDF容器
                console.log("检查所有可滚动容器...");
                document.querySelectorAll('*').forEach(el => {
                    if ((el.scrollHeight > el.clientHeight) && 
                        (typeof el.scrollTo === 'function' || 'scrollTop' in el)) {
                        console.log(`找到可滚动元素:`, el);
                    }
                });
                
                // 使用最简单的策略 - 直接估算位置并滚动
                const directScrollContainer = document.querySelector('.rpv-core__inner-pages') || 
                                           document.querySelector('.rpv-core__viewer-container') ||
                                           document.querySelector('.pdf-viewer') ||
                                           document.querySelector('[role="presentation"]');
                
                if (directScrollContainer) {
                    console.log(`找到滚动容器:`, directScrollContainer);
                    
                    // 直接估算位置 - 假设每页高度约为842px (A4标准高度)
                    const estimatedPageHeight = 842;
                    // 估算目标位置 (页码-1) * 页高 + 页内位置
                    const targetPosition = (pageNumber - 1) * estimatedPageHeight + position.top;
                    
                    console.log(`估算滚动位置: ${targetPosition}px ((页码${pageNumber} - 1) * ${estimatedPageHeight}px + ${position.top}px)`);
                    
                    // 执行滚动
                    try {
                        directScrollContainer.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                        
                        // 添加高亮视觉提示
                        setTimeout(() => {
                            // 在当前视图区域中添加高亮
                            const viewportHeight = directScrollContainer.clientHeight;
                            const currentScrollPos = directScrollContainer.scrollTop;
                            
                            console.log(`当前滚动位置: ${currentScrollPos}px, 视口高度: ${viewportHeight}px`);
                            
                            // 在视图中心添加高亮
                            const highlightPos = currentScrollPos + (viewportHeight / 2);
                            console.log(`在位置 ${highlightPos}px 添加高亮指示器`);
                            
                            addHighlightAtPosition(highlightPos, position.left || 50);
                        }, 500);
                    } catch (error) {
                        console.error('滚动失败:', error);
                        // 备选方法
                        directScrollContainer.scrollTop = targetPosition;
                        
                        // 添加高亮
                        setTimeout(() => {
                            addHighlightAtPosition(directScrollContainer.scrollTop + 100, position.left || 50);
                        }, 300);
                    }
                } else {
                    console.error('找不到任何可滚动容器');
                }
                
                // 清除待处理跳转
                setPendingJump(null);
            }, 1000);
            
            return () => clearTimeout(scrollTimeout);
        }
    }, [pendingJump, forcePage]);
    
    // 简化的高亮指示器添加函数
    const addHighlightAtPosition = (top, left) => {
        const highlightDiv = document.createElement('div');
        highlightDiv.className = 'position-highlight';
        highlightDiv.style.position = 'absolute';
        highlightDiv.style.top = `${top}px`;
        highlightDiv.style.left = `${left}px`;
        highlightDiv.style.width = '80%';
        highlightDiv.style.height = '40px';
        highlightDiv.style.backgroundColor = 'rgba(0, 123, 255, 0.3)';
        highlightDiv.style.borderRadius = '4px';
        highlightDiv.style.zIndex = '100';
        highlightDiv.style.animation = 'highlight-pulse 2s ease-in-out';
        
        // 寻找合适的容器
        const container = document.querySelector('.pdf-viewer') || 
                        document.querySelector('.rpv-core__viewer-container') ||
                        document.querySelector('.rpv-core__inner-pages') ||
                        document.body;
        
        if (container) {
            console.log('将高亮添加到容器:', container);
            container.appendChild(highlightDiv);
            setTimeout(() => {
                if (container.contains(highlightDiv)) {
                    container.removeChild(highlightDiv);
                }
            }, 2000);
        }
    };
    
    // 修改目录点击处理函数，使用新的两步跳转方法
    const handleBookmarkClick = (item) => {
        if (!item.pageNumber) return;
        
        console.log('点击目录项:', item);
        
        // 直接使用新的两步跳转函数
        jumpAndScroll(item.pageNumber, item.position);
    };
    
    // 修改图表跳转处理函数，使用新的两步跳转方法
    const handleFigureJump = (figure) => {
        if (!figure.pageNumber) return;
        
        console.log('跳转到图表:', figure);
        
        // 直接使用新的两步跳转函数
        jumpAndScroll(figure.pageNumber, figure.position);
    };

    const handleTextSelection = (event) => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        if (text) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            setSelectedText(text);
            setToolbarPosition({
                x: rect.left + (rect.width / 2) - 50,
                y: rect.top - 40
            });
            setSearchResult(null);
        } else {
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

    // 切换侧边栏显示状态
    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
        if (!showSidebar) {
            setActiveTab('bookmark');
        }
    };

    // 专门用于调试查看器组件的钩子
    useEffect(() => {
        if (!pdfUrl || !viewerRef.current) return;
        
        // 延迟执行，确保PDF查看器已渲染
        const debugTimer = setTimeout(() => {
            console.log('===== PDF 查看器调试信息 =====');
            console.log('当前页码:', currentPage);
            console.log('viewerRef.current 值:', viewerRef.current);
            
            // 尝试输出查看器内部结构
            const viewerContainer = document.querySelector('.rpv-core__viewer-container');
            const viewerPages = document.querySelectorAll('.rpv-core__page');
            const docContainer = document.querySelector('.rpv-core__doc-container');
            
            console.log('页面选择器测试:');
            console.log('- rpv-core__viewer-container:', viewerContainer);
            console.log('- rpv-core__page 元素数量:', viewerPages.length);
            console.log('- rpv-core__doc-container:', docContainer);
            
            // 检查滚动容器
            const scrollContainers = [
                '.rpv-core__viewer',
                '.rpv-core__doc-container',
                '.rpv-core__viewer-container',
                '.rpv-core__inner-container',
                '.rpv-core__scrollable-container',
                '.pdf-viewer'
            ];
            
            console.log('测试可滚动容器:');
            for (const selector of scrollContainers) {
                const element = document.querySelector(selector);
                if (element) {
                    console.log(`- ${selector} 元素:`, element);
                    console.log(`  * 是否具有滚动功能:`, 
                        typeof element.scrollTo === 'function' || typeof element.scroll === 'function' || 'scrollTop' in element);
                } else {
                    console.log(`- ${selector} 元素: 未找到`);
                }
            }
            
            // 手动尝试获取一个元素并测试滚动
            const testScroll = () => {
                const container = document.querySelector('.rpv-core__viewer-container') || 
                                 document.querySelector('.rpv-core__doc-container') ||
                                 document.querySelector('.rpv-core__viewer') ||
                                 pdfViewerContainerRef.current;
                
                if (container) {
                    console.log('尝试在这个容器上执行滚动:', container);
                    try {
                        // 记录初始滚动位置
                        const initialScroll = container.scrollTop;
                        console.log('  * 初始滚动位置:', initialScroll);
                        
                        // 尝试滚动
                        container.scrollTo({ top: initialScroll + 100, behavior: 'smooth' });
                        
                        // 检查滚动是否成功
                        setTimeout(() => {
                            console.log('  * 滚动后位置:', container.scrollTop);
                            console.log('  * 滚动是否生效:', container.scrollTop !== initialScroll);
                            
                            if (container.scrollTop === initialScroll) {
                                console.log('  * 滚动未生效，尝试替代方法');
                                // 尝试其他方法
                                container.scrollTop = initialScroll + 100;
                                console.log('  * 使用scrollTop后:', container.scrollTop);
                            }
                        }, 500);
                    } catch (err) {
                        console.error('  * 滚动测试失败:', err);
                    }
                } else {
                    console.log('找不到可滚动容器，无法测试滚动');
                }
            };
            
            // 运行滚动测试
            testScroll();
            
            // 获取特定的页面元素，并输出相关属性
            if (viewerPages.length > 0) {
                const firstPage = viewerPages[0];
                console.log('第一页元素详情:');
                console.log('- offsetTop:', firstPage.offsetTop);
                console.log('- offsetLeft:', firstPage.offsetLeft);
                console.log('- clientHeight:', firstPage.clientHeight);
                console.log('- 定位:', firstPage.style.position);
                console.log('- transform:', firstPage.style.transform);
                
                // 尝试解析transform以获取scale
                if (firstPage.style.transform) {
                    const scaleMatch = firstPage.style.transform.match(/scale\(([^)]+)\)/);
                    console.log('- 缩放比例:', scaleMatch ? scaleMatch[1] : '无法解析');
                }
            }
            
            console.log('===== 调试信息结束 =====');
        }, 2000); // 等待2秒确保PDF已完全加载
        
        return () => clearTimeout(debugTimer);
    }, [pdfUrl, currentPage]); // 修复依赖数组警告，移除defaultLayoutPluginInstance

    if (loadingPdf) {
        return (
            <div className="pdf-loading-container">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">加载文档中...</p>
            </div>
        );
    }

    if (!pdfUrl) {
        return (
            <div className="pdf-error">
                <div className="alert alert-warning">
                    <h5>未找到PDF文件</h5>
                    <p>请确认文档ID是否正确，或返回文档列表重新选择文档。</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pdf-container">
            <div className="pdf-header">
                <h5 className="pdf-title">文档查看器</h5>
                <div className="pdf-navigation">
                    <span>第 {currentPage} 页</span>
                </div>
                <Button variant="outline-secondary" size="sm" onClick={() => window.history.back()}>
                    <XLg /> 关闭
                </Button>
            </div>
            
            <div className="pdf-content">
                {/* 左侧工具栏 */}
                <div className="pdf-toolbar">
                    <Button
                        variant="link"
                        className={`toolbar-button ${showSidebar && activeTab === 'bookmark' ? 'active' : ''}`}
                        onClick={toggleSidebar}
                        title="目录"
                    >
                        <List size={24} />
                    </Button>
                </div>

                <div 
                    className="pdf-viewer-container"
                    onMouseUp={handleTextSelection}
                    ref={pdfViewerContainerRef}
                >
                    <Worker workerUrl={`${process.env.PUBLIC_URL}/pdf.worker.min.js`}>
                        <div className="pdf-viewer">
                            <Viewer
                                fileUrl={pdfUrl}
                                plugins={[
                                    defaultLayoutPluginInstance,
                                    scrollModePluginInstance, 
                                    pageNavigationPluginInstance
                                ]}
                                ref={viewerRef}
                                onPageChange={(e) => {
                                    setCurrentPage(e.currentPage + 1);
                                    // 验证viewerRef在页面变化时是否可用
                                    console.log('页面变化时viewerRef状态:', viewerRef.current);
                                }}
                                defaultScale={1}
                                onDocumentLoaded={(e) => {
                                    console.log('PDF文档加载完成');
                                    console.log('文档总页数:', e.doc.numPages);
                                    
                                    // 确保viewerRef在文档加载后可用
                                    if (viewerRef.current) {
                                        console.log('viewerRef已成功初始化:', viewerRef.current);
                                        
                                        // 测试viewerRef的setPage方法是否可用
                                        try {
                                            console.log('测试viewerRef.setPage方法');
                                            console.log('当前页码:', currentPage);
                                            
                                            // 尝试跳转到第1页（索引0）然后回到当前页
                                            setTimeout(() => {
                                                try {
                                                    viewerRef.current.setPage(0);
                                                    console.log('成功跳转到第1页');
                                                    
                                                    // 1秒后跳回当前页
                                                    setTimeout(() => {
                                                        try {
                                                            viewerRef.current.setPage(currentPage - 1);
                                                            console.log('成功跳回原页面');
                                                        } catch (err) {
                                                            console.error('跳回原页面失败:', err);
                                                        }
                                                    }, 1000);
                                                } catch (err) {
                                                    console.error('页面跳转测试失败:', err);
                                                }
                                            }, 2000);
                                        } catch (err) {
                                            console.error('viewerRef测试失败:', err);
                                        }
                                    } else {
                                        console.warn('文档加载后viewerRef未能正确初始化');
                                        
                                        // 尝试分析原因
                                        console.log('Viewer组件:', document.querySelector('.rpv-core__viewer'));
                                        console.log('PDF加载状态:', e);
                                    }
                                    
                                    // 记录插件API可用性
                                    if (pageNavigationPluginInstance.jumpToPage) {
                                        console.log('jumpToPage API可用');
                                        
                                        // 如果viewerRef不可用，尝试使用插件API
                                        if (!viewerRef.current) {
                                            console.log('由于viewerRef不可用，保存jumpToPage API以备用');
                                            window.pdfJumpToPage = pageNavigationPluginInstance.jumpToPage;
                                        }
                                    }
                                    
                                    if (scrollModePluginInstance.switchScrollMode) {
                                        console.log('switchScrollMode API可用');
                                        window.pdfSwitchScrollMode = scrollModePluginInstance.switchScrollMode;
                                    }
                                    
                                    // 测试页面元素选择器，便于调试
                                    setTimeout(() => {
                                        const pages = document.querySelectorAll('.rpv-core__page');
                                        const container = document.querySelector('.rpv-core__viewer-container');
                                        console.log(`找到${pages.length}个页面元素`);
                                        console.log('滚动容器:', container);
                                        
                                        // 注册全局滚动监听器，帮助调试
                                        if (container) {
                                            container.addEventListener('scroll', () => {
                                                console.log('当前滚动位置:', container.scrollTop);
                                            });
                                        }
                                    }, 1000);
                                }}
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

                {/* 右侧边栏 */}
                {showSidebar && (
                    <div className="pdf-sidebar">
                        <Nav variant="tabs" className="pdf-sidebar-nav">
                            <Nav.Item>
                                <Nav.Link 
                                    active={activeTab === 'bookmark'}
                                    onClick={() => setActiveTab('bookmark')}
                                >
                                    目录
                                </Nav.Link>
                            </Nav.Item>
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
                                <Tab.Pane active={activeTab === 'bookmark'}>
                                    <div className="bookmark-container">
                                        {structureLoading ? (
                                            <div className="text-center p-3">
                                                <Spinner animation="border" size="sm" />
                                                <p className="mt-2">加载目录中...</p>
                                            </div>
                                        ) : documentStructure ? (
                                            <BookmarkTree 
                                                items={documentStructure}
                                                onItemClick={handleBookmarkClick}
                                                expandedNodes={expandedNodes}
                                                setExpandedNodes={setExpandedNodes}
                                                currentPage={currentPage}
                                            />
                                        ) : (
                                            <div className="text-center text-muted p-3">
                                                <p>暂无目录信息</p>
                                            </div>
                                        )}
                                    </div>
                                </Tab.Pane>
                                <Tab.Pane active={activeTab === 'summary'}>
                                    <div className="p-3">
                                        <h6>文档总结</h6>
                                        <p>这里显示文档的总结内容...</p>
                                    </div>
                                </Tab.Pane>
                                <Tab.Pane active={activeTab === 'charts'}>
                                    <div className="p-3">
                                        <h6>图表分析</h6>
                                        {figuresLoading ? (
                                            <div className="text-center p-3">
                                                <Spinner animation="border" size="sm" />
                                                <p className="mt-2">加载图表数据中...</p>
                                            </div>
                                        ) : figures.length === 0 ? (
                                            <div className="text-muted">暂无图表数据</div>
                                        ) : (
                                            figures.map((fig, idx) => (
                                                <div key={fig.figureId || idx} className="figure-block mb-4">
                                                    <img src={fig.imageUrl} alt={fig.caption} className="figure-img" style={{maxWidth: '100%'}} />
                                                    <div className="figure-caption mt-2">{fig.caption}</div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        className="mt-1"
                                                        onClick={() => handleFigureJump(fig)}
                                                        title={`跳转到第${fig.pageNumber}页的图表位置`}
                                                    >
                                                        跳转到图表位置
                                                    </Button>
                                                </div>
                                            ))
                                        )}
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
                )}
            </div>
        </div>
    );
};

export default PDFViewer;