/**
 * SVG渲染器 - 使用SVG渲染表格
 */
class SvgRenderer {
    constructor(svg, virtualScroll) {
        this.svg = svg;
        this.virtualScroll = virtualScroll;
        
        // 样式配置
        this.styles = {
            headerBackground: '#495057',
            headerTextColor: '#ffffff',
            headerFontSize: '14px',
            headerFontWeight: '600',
            rowBackground: '#ffffff',
            alternateRowBackground: '#f8f9fa',
            hoverRowBackground: '#e3f2fd',
            textColor: '#212529',
            borderColor: '#e9ecef',
            fontSize: '14px',
            fontFamily: '"Segoe UI", sans-serif',
            cellPadding: 12,
            borderWidth: 1
        };
        
        // SVG元素组
        this.headerGroup = null;
        this.bodyGroup = null;
        this.borderGroup = null;
        
        // 鼠标状态
        this.hoveredRow = -1;
        
        this.init();
    }
    
    /**
     * 初始化
     */
    init() {
        this.setupSvg();
        this.createGroups();
        this.bindEvents();
    }
    
    /**
     * 设置SVG
     */
    setupSvg() {
        const container = this.svg.parentElement;
        const rect = container.getBoundingClientRect();
        
        // 获取容器尺寸，如果为0则使用默认值
        let width = rect.width || 1200;
        let height = rect.height || 600;
        
        // 设置SVG尺寸
        this.svg.setAttribute('width', width);
        this.svg.setAttribute('height', height);
        this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        
        // 设置样式
        this.svg.style.overflow = 'hidden';
        this.svg.style.userSelect = 'none';
        this.svg.style.display = 'block';
    }
    
    /**
     * 创建SVG组
     */
    createGroups() {
        // 清空现有内容
        this.svg.innerHTML = '';
        
        // 创建定义区域
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        this.svg.appendChild(defs);
        
        // 创建裁剪路径
        const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', 'tableClip');
        const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        clipRect.setAttribute('x', '0');
        clipRect.setAttribute('y', this.virtualScroll.headerHeight);
        clipRect.setAttribute('width', '100%');
        clipRect.setAttribute('height', `calc(100% - ${this.virtualScroll.headerHeight}px)`);
        clipPath.appendChild(clipRect);
        defs.appendChild(clipPath);
        
        // 创建表头组
        this.headerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.headerGroup.setAttribute('class', 'header-group');
        this.svg.appendChild(this.headerGroup);
        
        // 创建表体组
        this.bodyGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.bodyGroup.setAttribute('class', 'body-group');
        this.bodyGroup.setAttribute('clip-path', 'url(#tableClip)');
        this.svg.appendChild(this.bodyGroup);
        
        // 创建边框组
        this.borderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.borderGroup.setAttribute('class', 'border-group');
        this.svg.appendChild(this.borderGroup);
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 鼠标移动事件
        this.svg.addEventListener('mousemove', (e) => {
            const rect = this.svg.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            
            this.updateHoveredRow(mouseY);
        });
        
        // 鼠标离开事件
        this.svg.addEventListener('mouseleave', () => {
            this.hoveredRow = -1;
            this.render();
        });
        
        // 滚轮事件
        this.svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const deltaY = e.deltaY;
            const deltaX = e.deltaX;
            
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                // 垂直滚动
                const newScrollTop = this.virtualScroll.scrollTop + deltaY;
                this.virtualScroll.handleVerticalScroll(newScrollTop);
            } else {
                // 水平滚动
                const newScrollLeft = this.virtualScroll.scrollLeft + deltaX;
                this.virtualScroll.handleHorizontalScroll(newScrollLeft);
            }
        });
        
        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.setupSvg();
            this.createGroups();
            this.virtualScroll.updateDimensions();
            this.render();
        });
    }
    
    /**
     * 更新悬停行
     */
    updateHoveredRow(mouseY) {
        const headerHeight = this.virtualScroll.headerHeight;
        const rowHeight = this.virtualScroll.rowHeight;
        
        if (mouseY < headerHeight) {
            this.hoveredRow = -1;
        } else {
            const relativeY = mouseY - headerHeight + this.virtualScroll.scrollTop;
            const rowIndex = Math.floor(relativeY / rowHeight);
            
            if (rowIndex >= 0 && rowIndex < this.virtualScroll.filteredData.length) {
                this.hoveredRow = rowIndex;
            } else {
                this.hoveredRow = -1;
            }
        }
        
        this.render();
    }
    
    /**
     * 渲染表格
     */
    render() {
        const startTime = performance.now();
        
        // 检查必要的组件是否存在
        if (!this.headerGroup || !this.bodyGroup || !this.borderGroup) {
            console.warn('SVG组未正确初始化');
            return;
        }
        
        // 清空现有内容
        this.headerGroup.innerHTML = '';
        this.bodyGroup.innerHTML = '';
        this.borderGroup.innerHTML = '';
        
        // 渲染表头
        this.renderHeader();
        
        // 渲染数据行
        this.renderRows();
        
        // 渲染边框
        this.renderBorders();
        
        const endTime = performance.now();
        
        // 更新渲染时间显示
        const renderTimeElement = document.getElementById('renderTime');
        if (renderTimeElement) {
            renderTimeElement.textContent = `渲染时间: ${Math.round(endTime - startTime)}ms`;
        }
    }
    
    /**
     * 渲染表头
     */
    renderHeader() {
        const { columns, headerHeight, scrollLeft } = this.virtualScroll;
        const { startColumnIndex, endColumnIndex } = this.virtualScroll.getVisibleColumns();
        const svgWidth = parseFloat(this.svg.getAttribute('width'));
        
        // 创建表头背景
        const headerBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        headerBg.setAttribute('x', '0');
        headerBg.setAttribute('y', '0');
        headerBg.setAttribute('width', svgWidth);
        headerBg.setAttribute('height', headerHeight);
        headerBg.setAttribute('fill', this.styles.headerBackground);
        this.headerGroup.appendChild(headerBg);
        
        let currentX = -scrollLeft;
        
        // 计算起始X位置
        for (let i = 0; i < startColumnIndex; i++) {
            currentX += columns[i].width;
        }
        
        // 渲染可见列的表头
        for (let i = startColumnIndex; i < endColumnIndex; i++) {
            const column = columns[i];
            
            // 创建文本元素
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', currentX + this.styles.cellPadding);
            text.setAttribute('y', headerHeight / 2);
            text.setAttribute('fill', this.styles.headerTextColor);
            text.setAttribute('font-family', this.styles.fontFamily);
            text.setAttribute('font-size', this.styles.headerFontSize);
            text.setAttribute('font-weight', this.styles.headerFontWeight);
            text.setAttribute('dominant-baseline', 'middle');
            text.textContent = column.title;
            
            this.headerGroup.appendChild(text);
            
            currentX += column.width;
        }
    }
    
    /**
     * 渲染数据行
     */
    renderRows() {
        const { columns, headerHeight, rowHeight, scrollLeft, scrollTop } = this.virtualScroll;
        const { startColumnIndex, endColumnIndex } = this.virtualScroll.getVisibleColumns();
        const visibleData = this.virtualScroll.getVisibleData();
        const svgWidth = parseFloat(this.svg.getAttribute('width'));
        const svgHeight = parseFloat(this.svg.getAttribute('height'));
        
        visibleData.forEach((row, index) => {
            const actualRowIndex = this.virtualScroll.startIndex + index;
            const y = headerHeight + (actualRowIndex * rowHeight) - scrollTop;
            
            // 跳过不在可见区域的行
            if (y + rowHeight < headerHeight || y > svgHeight) {
                return;
            }
            
            // 确定行背景色
            let backgroundColor = this.styles.rowBackground;
            if (actualRowIndex === this.hoveredRow) {
                backgroundColor = this.styles.hoverRowBackground;
            } else if (actualRowIndex % 2 === 1) {
                backgroundColor = this.styles.alternateRowBackground;
            }
            
            // 创建行背景
            const rowBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rowBg.setAttribute('x', '0');
            rowBg.setAttribute('y', y);
            rowBg.setAttribute('width', svgWidth);
            rowBg.setAttribute('height', rowHeight);
            rowBg.setAttribute('fill', backgroundColor);
            this.bodyGroup.appendChild(rowBg);
            
            let currentX = -scrollLeft;
            
            // 计算起始X位置
            for (let i = 0; i < startColumnIndex; i++) {
                currentX += columns[i].width;
            }
            
            // 渲染可见列的单元格
            for (let i = startColumnIndex; i < endColumnIndex; i++) {
                const column = columns[i];
                let cellValue = row[column.key];
                
                // 格式化特殊字段
                if (column.key === 'salary') {
                    cellValue = '¥' + cellValue.toLocaleString();
                } else if (typeof cellValue === 'number') {
                    cellValue = cellValue.toString();
                } else if (cellValue === null || cellValue === undefined) {
                    cellValue = '';
                }
                
                // 特殊处理过往经历字段 - 为了性能测试，显示完整内容
                // if (column.key === 'experience') {
                //     // 对于过往经历，显示前100个字符并添加省略号
                //     if (cellValue.length > 100) {
                //         cellValue = cellValue.substring(0, 100) + '...';
                //     }
                // }
                
                // 创建文本元素
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', currentX + this.styles.cellPadding);
                text.setAttribute('y', y + rowHeight / 2);
                text.setAttribute('fill', this.styles.textColor);
                text.setAttribute('font-family', this.styles.fontFamily);
                text.setAttribute('font-size', this.styles.fontSize);
                text.setAttribute('dominant-baseline', 'middle');
                
                // 设置文本裁剪
                const maxWidth = column.width - (this.styles.cellPadding * 2);
                const clippedText = this.clipText(cellValue, maxWidth);
                text.textContent = clippedText;
                
                this.bodyGroup.appendChild(text);
                
                currentX += column.width;
            }
        });
    }
    
    /**
     * 渲染边框
     */
    renderBorders() {
        const { columns, headerHeight, scrollLeft } = this.virtualScroll;
        const { startColumnIndex, endColumnIndex } = this.virtualScroll.getVisibleColumns();
        const svgWidth = parseFloat(this.svg.getAttribute('width'));
        const svgHeight = parseFloat(this.svg.getAttribute('height'));
        
        // 创建水平线（表头底部）
        const headerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        headerLine.setAttribute('x1', '0');
        headerLine.setAttribute('y1', headerHeight);
        headerLine.setAttribute('x2', svgWidth);
        headerLine.setAttribute('y2', headerHeight);
        headerLine.setAttribute('stroke', this.styles.borderColor);
        headerLine.setAttribute('stroke-width', this.styles.borderWidth);
        this.borderGroup.appendChild(headerLine);
        
        let currentX = -scrollLeft;
        
        // 计算起始X位置
        for (let i = 0; i < startColumnIndex; i++) {
            currentX += columns[i].width;
        }
        
        // 绘制可见列的垂直边框
        for (let i = startColumnIndex; i <= endColumnIndex; i++) {
            if (currentX >= 0 && currentX <= svgWidth) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', currentX);
                line.setAttribute('y1', '0');
                line.setAttribute('x2', currentX);
                line.setAttribute('y2', svgHeight);
                line.setAttribute('stroke', this.styles.borderColor);
                line.setAttribute('stroke-width', this.styles.borderWidth);
                this.borderGroup.appendChild(line);
            }
            
            if (i < columns.length) {
                currentX += columns[i].width;
            }
        }
    }
    
    /**
     * 裁剪文本以适应指定宽度
     */
    clipText(text, maxWidth) {
        // 创建临时SVG文本元素来测量宽度
        const tempText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tempText.setAttribute('font-family', this.styles.fontFamily);
        tempText.setAttribute('font-size', this.styles.fontSize);
        tempText.style.visibility = 'hidden';
        tempText.textContent = text;
        
        this.svg.appendChild(tempText);
        const textWidth = tempText.getBBox().width;
        this.svg.removeChild(tempText);
        
        if (textWidth <= maxWidth) {
            return text;
        }
        
        // 二分查找最佳长度
        let left = 0;
        let right = text.length;
        let result = '';
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const testText = text.substring(0, mid) + '...';
            
            tempText.textContent = testText;
            this.svg.appendChild(tempText);
            const testWidth = tempText.getBBox().width;
            this.svg.removeChild(tempText);
            
            if (testWidth <= maxWidth) {
                result = testText;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return result || '...';
    }
    
    /**
     * 更新数据
     */
    updateData() {
        this.render();
    }
    
    /**
     * 销毁
     */
    destroy() {
        // 移除事件监听器
        this.svg.removeEventListener('mousemove', this.handleMouseMove);
        this.svg.removeEventListener('mouseleave', this.handleMouseLeave);
        this.svg.removeEventListener('wheel', this.handleWheel);
        window.removeEventListener('resize', this.handleResize);
        
        // 清空SVG
        this.svg.innerHTML = '';
    }
}

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SvgRenderer;
}