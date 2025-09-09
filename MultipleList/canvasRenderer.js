/**
 * Canvas渲染器 - 使用Canvas高性能渲染表格
 */
class CanvasRenderer {
    constructor(canvas, virtualScroll) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.virtualScroll = virtualScroll;
        this.devicePixelRatio = window.devicePixelRatio || 1;
        
        // 样式配置
        this.styles = {
            headerBackground: '#495057',
            headerTextColor: '#ffffff',
            headerFont: '600 14px "Segoe UI", sans-serif',
            rowBackground: '#ffffff',
            alternateRowBackground: '#f8f9fa',
            hoverRowBackground: '#e3f2fd',
            textColor: '#212529',
            borderColor: '#e9ecef',
            cellFont: '14px "Segoe UI", sans-serif',
            cellPadding: 12,
            borderWidth: 1
        };
        
        // 鼠标状态
        this.mousePosition = { x: 0, y: 0 };
        this.hoveredRow = -1;
        
        this.init();
    }
    
    /**
     * 初始化
     */
    init() {
        this.setupCanvas();
        this.bindEvents();
    }
    
    /**
     * 设置Canvas
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // 设置Canvas尺寸
        this.canvas.width = rect.width * this.devicePixelRatio;
        this.canvas.height = rect.height * this.devicePixelRatio;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // 缩放上下文以适应设备像素比
        this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
        
        // 设置文本渲染质量
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 鼠标移动事件
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
            
            this.updateHoveredRow();
        });
        
        // 鼠标离开事件
        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredRow = -1;
            this.render();
        });
        
        // 滚轮事件
        this.canvas.addEventListener('wheel', (e) => {
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
            this.setupCanvas();
            this.virtualScroll.updateDimensions();
            this.render();
        });
    }
    
    /**
     * 更新悬停行
     */
    updateHoveredRow() {
        const headerHeight = this.virtualScroll.headerHeight;
        const rowHeight = this.virtualScroll.rowHeight;
        
        if (this.mousePosition.y < headerHeight) {
            this.hoveredRow = -1;
        } else {
            const relativeY = this.mousePosition.y - headerHeight + this.virtualScroll.scrollTop;
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
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width / this.devicePixelRatio, this.canvas.height / this.devicePixelRatio);
        
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
        
        // 绘制表头背景
        this.ctx.fillStyle = this.styles.headerBackground;
        this.ctx.fillRect(0, 0, this.canvas.width / this.devicePixelRatio, headerHeight);
        
        // 设置文本样式
        this.ctx.fillStyle = this.styles.headerTextColor;
        this.ctx.font = this.styles.headerFont;
        
        let currentX = -scrollLeft;
        
        // 计算起始X位置
        for (let i = 0; i < startColumnIndex; i++) {
            currentX += columns[i].width;
        }
        
        // 渲染可见列的表头
        for (let i = startColumnIndex; i < endColumnIndex; i++) {
            const column = columns[i];
            
            // 绘制文本
            this.ctx.fillText(
                column.title,
                currentX + this.styles.cellPadding,
                headerHeight / 2
            );
            
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
        
        // 设置文本样式
        this.ctx.font = this.styles.cellFont;
        
        visibleData.forEach((row, index) => {
            const actualRowIndex = this.virtualScroll.startIndex + index;
            const y = headerHeight + (actualRowIndex * rowHeight) - scrollTop;
            
            // 跳过不在可见区域的行
            if (y + rowHeight < headerHeight || y > this.canvas.height / this.devicePixelRatio) {
                return;
            }
            
            // 确定行背景色
            let backgroundColor = this.styles.rowBackground;
            if (actualRowIndex === this.hoveredRow) {
                backgroundColor = this.styles.hoverRowBackground;
            } else if (actualRowIndex % 2 === 1) {
                backgroundColor = this.styles.alternateRowBackground;
            }
            
            // 绘制行背景
            this.ctx.fillStyle = backgroundColor;
            this.ctx.fillRect(0, y, this.canvas.width / this.devicePixelRatio, rowHeight);
            
            // 设置文本颜色
            this.ctx.fillStyle = this.styles.textColor;
            
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
                
                // 裁剪文本以适应列宽
                const maxWidth = column.width - (this.styles.cellPadding * 2);
                const clippedText = this.clipText(cellValue, maxWidth);
                
                // 绘制文本
                this.ctx.fillText(
                    clippedText,
                    currentX + this.styles.cellPadding,
                    y + rowHeight / 2
                );
                
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
        const canvasWidth = this.canvas.width / this.devicePixelRatio;
        const canvasHeight = this.canvas.height / this.devicePixelRatio;
        
        this.ctx.strokeStyle = this.styles.borderColor;
        this.ctx.lineWidth = this.styles.borderWidth;
        
        // 绘制水平线（表头底部）
        this.ctx.beginPath();
        this.ctx.moveTo(0, headerHeight);
        this.ctx.lineTo(canvasWidth, headerHeight);
        this.ctx.stroke();
        
        // 绘制垂直线
        let currentX = -scrollLeft;
        
        // 计算起始X位置
        for (let i = 0; i < startColumnIndex; i++) {
            currentX += columns[i].width;
        }
        
        // 绘制可见列的垂直边框
        for (let i = startColumnIndex; i <= endColumnIndex; i++) {
            if (currentX >= 0 && currentX <= canvasWidth) {
                this.ctx.beginPath();
                this.ctx.moveTo(currentX, 0);
                this.ctx.lineTo(currentX, canvasHeight);
                this.ctx.stroke();
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
        const metrics = this.ctx.measureText(text);
        if (metrics.width <= maxWidth) {
            return text;
        }
        
        // 二分查找最佳长度
        let left = 0;
        let right = text.length;
        let result = '';
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const testText = text.substring(0, mid) + '...';
            const testMetrics = this.ctx.measureText(testText);
            
            if (testMetrics.width <= maxWidth) {
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
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
        this.canvas.removeEventListener('wheel', this.handleWheel);
        window.removeEventListener('resize', this.handleResize);
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CanvasRenderer;
}