/**
 * 表格管理器 - 协调虚拟滚动和渲染器的核心控制器
 */
class TableManager {
    constructor(options = {}) {
        this.container = options.container;
        this.canvasContainer = options.canvasContainer;
        this.svgContainer = options.svgContainer;
        this.canvas = options.canvas;
        this.svg = options.svg;
        
        // 当前渲染模式
        this.renderMode = 'canvas';
        
        // 数据
        this.data = [];
        this.filteredData = [];
        
        // 搜索过滤器
        this.filters = {
            name: '',
            department: '',
            city: '',
            experience: ''
        };
        
        // 虚拟滚动管理器
        this.virtualScroll = null;
        
        // 渲染器
        this.canvasRenderer = null;
        this.svgRenderer = null;
        this.currentRenderer = null;
        
        // 滚动条管理器
        this.scrollbarManager = null;
        
        // 状态
        this.isLoading = false;
        
        this.init();
    }
    
    /**
     * 初始化
     */
    init() {
        this.initVirtualScroll();
        this.initRenderers();
        this.initScrollbars();
        this.bindEvents();
        // 延迟更新状态信息，确保所有组件都已初始化
        setTimeout(() => {
            this.updateStatusInfo();
        }, 0);
    }
    
    /**
     * 初始化虚拟滚动
     */
    initVirtualScroll() {
        this.virtualScroll = new VirtualScrollManager({
            container: this.container,
            data: this.data,
            onScroll: (scrollInfo) => {
                this.handleScroll(scrollInfo);
            },
            onDataChange: (changeInfo) => {
                this.handleDataChange(changeInfo);
            }
        });
    }
    
    /**
     * 初始化渲染器
     */
    initRenderers() {
        // 检查Canvas元素是否存在
        if (!this.canvas) {
            console.error('Canvas元素未找到');
            return;
        }
        
        // 检查SVG元素是否存在
        if (!this.svg) {
            console.error('SVG元素未找到');
            return;
        }
        
        // Canvas渲染器
        this.canvasRenderer = new CanvasRenderer(this.canvas, this.virtualScroll);
        
        // SVG渲染器
        this.svgRenderer = new SvgRenderer(this.svg, this.virtualScroll);
        
        // 设置当前渲染器
        this.currentRenderer = this.canvasRenderer;
    }
    
    /**
     * 初始化滚动条
     */
    initScrollbars() {
        // 检查容器是否存在
        if (!this.canvasContainer || !this.svgContainer) {
            console.error('滚动条容器未找到');
            return;
        }
        
        this.scrollbarManager = new ScrollbarManager({
            virtualScroll: this.virtualScroll,
            canvasContainer: this.canvasContainer,
            svgContainer: this.svgContainer
        });
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 渲染模式切换
        const renderModeInputs = document.querySelectorAll('input[name="renderMode"]');
        renderModeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.switchRenderMode(e.target.value);
                }
            });
        });
        
        // 搜索输入
        const nameSearch = document.getElementById('nameSearch');
        const departmentSearch = document.getElementById('departmentSearch');
        const citySearch = document.getElementById('citySearch');
        const experienceSearch = document.getElementById('experienceSearch');
        
        if (nameSearch) {
            nameSearch.addEventListener('input', (e) => {
                this.filters.name = e.target.value;
                this.applyFilters();
            });
        }
        
        if (departmentSearch) {
            departmentSearch.addEventListener('input', (e) => {
                this.filters.department = e.target.value;
                this.applyFilters();
            });
        }
        
        if (citySearch) {
            citySearch.addEventListener('input', (e) => {
                this.filters.city = e.target.value;
                this.applyFilters();
            });
        }
        
        if (experienceSearch) {
            experienceSearch.addEventListener('input', (e) => {
                this.filters.experience = e.target.value;
                this.applyFilters();
            });
        }
        
        // 清除搜索
        const clearSearchBtn = document.getElementById('clearSearch');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
        
        // 生成测试数据
        const generateDataBtn = document.getElementById('generateData');
        if (generateDataBtn) {
            generateDataBtn.addEventListener('click', () => {
                this.generateTestData();
            });
        }
    }
    
    /**
     * 切换渲染模式
     */
    switchRenderMode(mode) {
        if (this.renderMode === mode) return;
        
        this.renderMode = mode;
        
        if (mode === 'canvas') {
            this.canvasContainer.style.display = 'block';
            this.svgContainer.style.display = 'none';
            this.currentRenderer = this.canvasRenderer;
            if (this.scrollbarManager) {
                this.scrollbarManager.switchContainer('canvas');
            }
        } else {
            this.canvasContainer.style.display = 'none';
            this.svgContainer.style.display = 'block';
            this.currentRenderer = this.svgRenderer;
            
            // 重新设置SVG尺寸
            if (this.svgRenderer) {
                this.svgRenderer.setupSvg();
            }
            
            if (this.scrollbarManager) {
                this.scrollbarManager.switchContainer('svg');
            }
        }
        
        // 重新渲染
        if (this.currentRenderer && typeof this.currentRenderer.render === 'function') {
            this.currentRenderer.render();
        }
        this.scrollbarManager.updateScrollbars();
    }
    
    /**
     * 处理滚动事件
     */
    handleScroll(scrollInfo) {
        // 更新滚动条
        if (this.scrollbarManager) {
            this.scrollbarManager.updateScrollbars();
        }
        
        // 更新状态信息
        this.updateStatusInfo();
        
        // 重新渲染
        if (this.currentRenderer && typeof this.currentRenderer.render === 'function') {
            this.currentRenderer.render();
        }
    }
    
    /**
     * 处理数据变化
     */
    handleDataChange(changeInfo) {
        // 更新状态信息
        this.updateStatusInfo();
        
        // 重新渲染
        if (this.currentRenderer && typeof this.currentRenderer.render === 'function') {
            this.currentRenderer.render();
        }
    }
    
    /**
     * 应用过滤器
     */
    applyFilters() {
        this.virtualScroll.filterData(this.filters);
        this.scrollbarManager.updateScrollbars();
        this.updateStatusInfo();
    }
    
    /**
     * 清除过滤器
     */
    clearFilters() {
        this.filters = {
            name: '',
            department: '',
            city: '',
            experience: ''
        };
        
        // 清空搜索输入框
        const nameSearch = document.getElementById('nameSearch');
        const departmentSearch = document.getElementById('departmentSearch');
        const citySearch = document.getElementById('citySearch');
        const experienceSearch = document.getElementById('experienceSearch');
        
        if (nameSearch) nameSearch.value = '';
        if (departmentSearch) departmentSearch.value = '';
        if (citySearch) citySearch.value = '';
        if (experienceSearch) experienceSearch.value = '';
        
        this.applyFilters();
    }
    
    /**
     * 生成测试数据
     */
    async generateTestData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const generateBtn = document.getElementById('generateData');
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.textContent = '生成中...';
        }
        
        try {
            // 显示加载状态
            this.showLoading();
            
            // 生成数据
            const data = await DataGenerator.generateTestData(1000000, (progress) => {
                this.updateLoadingProgress(progress);
            });
            
            // 设置数据
            this.setData(data);
            
            // 隐藏加载状态
            this.hideLoading();
            
        } catch (error) {
            console.error('生成数据失败:', error);
            alert('生成数据失败，请重试');
        } finally {
            this.isLoading = false;
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.textContent = '生成测试数据';
            }
        }
    }
    
    /**
     * 设置数据
     */
    setData(data) {
        this.data = data;
        this.virtualScroll.setData(data);
        this.scrollbarManager.updateScrollbars();
        this.updateStatusInfo();
        this.currentRenderer.render();
    }
    
    /**
     * 显示加载状态
     */
    showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loadingOverlay';
        loadingDiv.className = 'loading';
        loadingDiv.innerHTML = '正在生成数据...';
        
        this.container.appendChild(loadingDiv);
    }
    
    /**
     * 更新加载进度
     */
    updateLoadingProgress(progress) {
        const loadingDiv = document.getElementById('loadingOverlay');
        if (loadingDiv) {
            loadingDiv.innerHTML = `正在生成数据... ${progress.percentage}% (${progress.current}/${progress.total})`;
        }
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const loadingDiv = document.getElementById('loadingOverlay');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
    
    /**
     * 更新状态信息
     */
    updateStatusInfo() {
        // 添加null检查，确保virtualScroll已正确初始化
        if (!this.virtualScroll || typeof this.virtualScroll.getScrollInfo !== 'function') {
            return;
        }
        
        const scrollInfo = this.virtualScroll.getScrollInfo();
        
        // 更新数据量显示
        const dataCountElement = document.getElementById('dataCount');
        if (dataCountElement) {
            dataCountElement.textContent = `数据量: ${this.virtualScroll.filteredData.length.toLocaleString()}`;
        }
        
        // 更新可见行数
        const visibleRowsElement = document.getElementById('visibleRows');
        if (visibleRowsElement) {
            const visibleCount = scrollInfo.endIndex - scrollInfo.startIndex;
            visibleRowsElement.textContent = `可见行: ${visibleCount}`;
        }
        
        // 更新总行数
        const totalRowsElement = document.getElementById('totalRows');
        if (totalRowsElement) {
            totalRowsElement.textContent = `总行数: ${scrollInfo.totalRows.toLocaleString()}`;
        }
        
        // 更新滚动位置
        const scrollPositionElement = document.getElementById('scrollPosition');
        if (scrollPositionElement) {
            const scrollPercentage = scrollInfo.maxScrollTop > 0 
                ? Math.round((scrollInfo.scrollTop / scrollInfo.maxScrollTop) * 100)
                : 0;
            scrollPositionElement.textContent = `滚动位置: ${scrollPercentage}%`;
        }
    }
    
    /**
     * 销毁
     */
    destroy() {
        if (this.virtualScroll) {
            this.virtualScroll.destroy();
        }
        
        if (this.canvasRenderer) {
            this.canvasRenderer.destroy();
        }
        
        if (this.svgRenderer) {
            this.svgRenderer.destroy();
        }
        
        if (this.scrollbarManager) {
            this.scrollbarManager.destroy();
        }
    }
}

/**
 * 滚动条管理器
 */
class ScrollbarManager {
    constructor(options) {
        this.virtualScroll = options.virtualScroll;
        this.canvasContainer = options.canvasContainer;
        this.svgContainer = options.svgContainer;
        this.currentContainer = this.canvasContainer;
        
        this.isDragging = false;
        this.dragType = null; // 'vertical' or 'horizontal'
        this.dragStartPos = 0;
        this.dragStartScroll = 0;
        
        this.bindEvents();
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 绑定Canvas容器的滚动条事件
        this.bindContainerEvents(this.canvasContainer, 'canvas');
        
        // 绑定SVG容器的滚动条事件
        this.bindContainerEvents(this.svgContainer, 'svg');
    }
    
    /**
     * 绑定容器事件
     */
    bindContainerEvents(container, prefix) {
        const verticalScrollbar = container.querySelector(`#${prefix === 'canvas' ? '' : 'svg'}verticalScrollbar`);
        const horizontalScrollbar = container.querySelector(`#${prefix === 'canvas' ? '' : 'svg'}horizontalScrollbar`);
        const verticalThumb = container.querySelector(`#${prefix === 'canvas' ? '' : 'svg'}verticalThumb`);
        const horizontalThumb = container.querySelector(`#${prefix === 'canvas' ? '' : 'svg'}horizontalThumb`);
        
        if (verticalThumb) {
            verticalThumb.addEventListener('mousedown', (e) => {
                this.startDrag(e, 'vertical');
            });
        }
        
        if (horizontalThumb) {
            horizontalThumb.addEventListener('mousedown', (e) => {
                this.startDrag(e, 'horizontal');
            });
        }
        
        if (verticalScrollbar) {
            verticalScrollbar.addEventListener('click', (e) => {
                if (e.target === verticalScrollbar) {
                    this.handleScrollbarClick(e, 'vertical');
                }
            });
        }
        
        if (horizontalScrollbar) {
            horizontalScrollbar.addEventListener('click', (e) => {
                if (e.target === horizontalScrollbar) {
                    this.handleScrollbarClick(e, 'horizontal');
                }
            });
        }
    }
    
    /**
     * 开始拖拽
     */
    startDrag(e, type) {
        e.preventDefault();
        this.isDragging = true;
        this.dragType = type;
        
        if (type === 'vertical') {
            this.dragStartPos = e.clientY;
            this.dragStartScroll = this.virtualScroll.scrollTop;
        } else {
            this.dragStartPos = e.clientX;
            this.dragStartScroll = this.virtualScroll.scrollLeft;
        }
        
        document.addEventListener('mousemove', this.handleDrag.bind(this));
        document.addEventListener('mouseup', this.endDrag.bind(this));
    }
    
    /**
     * 处理拖拽
     */
    handleDrag(e) {
        if (!this.isDragging) return;
        
        const scrollInfo = this.virtualScroll.getScrollInfo();
        
        if (this.dragType === 'vertical') {
            const deltaY = e.clientY - this.dragStartPos;
            const scrollbarHeight = this.currentContainer.querySelector('.vertical-scrollbar').offsetHeight;
            const thumbHeight = Math.max(20, (scrollInfo.containerHeight / scrollInfo.totalHeight) * scrollbarHeight);
            const maxThumbTop = scrollbarHeight - thumbHeight;
            
            const scrollRatio = deltaY / maxThumbTop;
            const newScrollTop = this.dragStartScroll + (scrollRatio * scrollInfo.maxScrollTop);
            
            this.virtualScroll.handleVerticalScroll(newScrollTop);
        } else {
            const deltaX = e.clientX - this.dragStartPos;
            const scrollbarWidth = this.currentContainer.querySelector('.horizontal-scrollbar').offsetWidth;
            const thumbWidth = Math.max(20, (scrollInfo.containerWidth / scrollInfo.totalWidth) * scrollbarWidth);
            const maxThumbLeft = scrollbarWidth - thumbWidth;
            
            const scrollRatio = deltaX / maxThumbLeft;
            const newScrollLeft = this.dragStartScroll + (scrollRatio * scrollInfo.maxScrollLeft);
            
            this.virtualScroll.handleHorizontalScroll(newScrollLeft);
        }
    }
    
    /**
     * 结束拖拽
     */
    endDrag() {
        this.isDragging = false;
        this.dragType = null;
        
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('mouseup', this.endDrag);
    }
    
    /**
     * 处理滚动条点击
     */
    handleScrollbarClick(e, type) {
        const scrollInfo = this.virtualScroll.getScrollInfo();
        
        if (type === 'vertical') {
            const rect = e.target.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const scrollbarHeight = rect.height;
            const ratio = clickY / scrollbarHeight;
            const newScrollTop = ratio * scrollInfo.maxScrollTop;
            
            this.virtualScroll.handleVerticalScroll(newScrollTop);
        } else {
            const rect = e.target.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const scrollbarWidth = rect.width;
            const ratio = clickX / scrollbarWidth;
            const newScrollLeft = ratio * scrollInfo.maxScrollLeft;
            
            this.virtualScroll.handleHorizontalScroll(newScrollLeft);
        }
    }
    
    /**
     * 切换容器
     */
    switchContainer(type) {
        this.currentContainer = type === 'canvas' ? this.canvasContainer : this.svgContainer;
        this.updateScrollbars();
    }
    
    /**
     * 更新滚动条
     */
    updateScrollbars() {
        const scrollInfo = this.virtualScroll.getScrollInfo();
        
        // 更新垂直滚动条
        this.updateVerticalScrollbar(scrollInfo);
        
        // 更新水平滚动条
        this.updateHorizontalScrollbar(scrollInfo);
    }
    
    /**
     * 更新垂直滚动条
     */
    updateVerticalScrollbar(scrollInfo) {
        const verticalThumb = this.currentContainer.querySelector('.vertical-scrollbar .scrollbar-thumb');
        if (!verticalThumb) return;
        
        const scrollbarHeight = verticalThumb.parentElement.offsetHeight;
        const thumbHeight = Math.max(20, (scrollInfo.containerHeight / scrollInfo.totalHeight) * scrollbarHeight);
        const maxThumbTop = scrollbarHeight - thumbHeight;
        const thumbTop = scrollInfo.maxScrollTop > 0 
            ? (scrollInfo.scrollTop / scrollInfo.maxScrollTop) * maxThumbTop
            : 0;
        
        verticalThumb.style.height = thumbHeight + 'px';
        verticalThumb.style.top = thumbTop + 'px';
        verticalThumb.style.display = scrollInfo.maxScrollTop > 0 ? 'block' : 'none';
    }
    
    /**
     * 更新水平滚动条
     */
    updateHorizontalScrollbar(scrollInfo) {
        const horizontalThumb = this.currentContainer.querySelector('.horizontal-scrollbar .scrollbar-thumb');
        if (!horizontalThumb) return;
        
        const scrollbarWidth = horizontalThumb.parentElement.offsetWidth;
        const thumbWidth = Math.max(20, (scrollInfo.containerWidth / scrollInfo.totalWidth) * scrollbarWidth);
        const maxThumbLeft = scrollbarWidth - thumbWidth;
        const thumbLeft = scrollInfo.maxScrollLeft > 0 
            ? (scrollInfo.scrollLeft / scrollInfo.maxScrollLeft) * maxThumbLeft
            : 0;
        
        horizontalThumb.style.width = thumbWidth + 'px';
        horizontalThumb.style.left = thumbLeft + 'px';
        horizontalThumb.style.display = scrollInfo.maxScrollLeft > 0 ? 'block' : 'none';
    }
    
    /**
     * 销毁
     */
    destroy() {
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('mouseup', this.endDrag);
    }
}

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TableManager, ScrollbarManager };
}