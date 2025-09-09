/**
 * 虚拟滚动管理器 - 处理大数据量的核心组件
 */
class VirtualScrollManager {
    constructor(options = {}) {
        this.container = options.container;
        this.data = options.data || [];
        this.filteredData = [...this.data];
        this.rowHeight = options.rowHeight || 40;
        this.headerHeight = options.headerHeight || 45;
        this.visibleRowCount = 0;
        this.scrollTop = 0;
        this.scrollLeft = 0;
        this.startIndex = 0;
        this.endIndex = 0;
        this.containerHeight = 0;
        this.containerWidth = 0;
        this.totalHeight = 0;
        this.totalWidth = 0;
        
        // 列配置
        this.columns = options.columns || [
            { key: 'id', title: 'ID', width: 80 },
            { key: 'name', title: '姓名', width: 120 },
            { key: 'department', title: '部门', width: 100 },
            { key: 'position', title: '职位', width: 140 },
            { key: 'city', title: '城市', width: 100 },
            { key: 'age', title: '年龄', width: 80 },
            { key: 'salary', title: '薪资', width: 100 },
            { key: 'joinDate', title: '入职日期', width: 120 },
            { key: 'email', title: '邮箱', width: 200 },
            { key: 'phone', title: '电话', width: 140 },
            { key: 'experience', title: '过往经历', width: 500 }
        ];
        
        // 缓冲区大小（额外渲染的行数）
        this.bufferSize = options.bufferSize || 5;
        
        // 事件回调
        this.onScroll = options.onScroll || (() => {});
        this.onDataChange = options.onDataChange || (() => {});
        
        this.init();
    }
    
    /**
     * 初始化
     */
    init() {
        this.updateDimensions();
        this.calculateVisibleRange();
    }
    
    /**
     * 更新容器尺寸
     */
    updateDimensions() {
        if (!this.container) return;
        
        const rect = this.container.getBoundingClientRect();
        this.containerHeight = rect.height;
        this.containerWidth = rect.width;
        
        // 如果容器尺寸为0，使用默认值
        if (this.containerHeight === 0) {
            this.containerHeight = 600; // 默认高度
        }
        if (this.containerWidth === 0) {
            this.containerWidth = 1200; // 默认宽度
        }
        
        // 计算可见行数
        this.visibleRowCount = Math.ceil((this.containerHeight - this.headerHeight) / this.rowHeight);
        
        // 计算总高度
        this.totalHeight = this.headerHeight + (this.filteredData.length * this.rowHeight);
        
        // 计算总宽度
        this.totalWidth = this.columns.reduce((sum, col) => sum + col.width, 0);
    }
    
    /**
     * 计算可见范围
     */
    calculateVisibleRange() {
        // 计算开始索引
        this.startIndex = Math.floor(this.scrollTop / this.rowHeight);
        
        // 添加缓冲区
        this.startIndex = Math.max(0, this.startIndex - this.bufferSize);
        
        // 计算结束索引
        this.endIndex = this.startIndex + this.visibleRowCount + (this.bufferSize * 2);
        this.endIndex = Math.min(this.filteredData.length, this.endIndex);
        
        // 触发数据变化回调
        this.onDataChange({
            startIndex: this.startIndex,
            endIndex: this.endIndex,
            visibleData: this.getVisibleData(),
            scrollTop: this.scrollTop,
            scrollLeft: this.scrollLeft
        });
    }
    
    /**
     * 获取可见数据
     */
    getVisibleData() {
        return this.filteredData.slice(this.startIndex, this.endIndex);
    }
    
    /**
     * 设置数据
     */
    setData(data) {
        this.data = data;
        this.filteredData = [...data];
        this.updateDimensions();
        this.calculateVisibleRange();
    }
    
    /**
     * 过滤数据
     */
    filterData(filters) {
        this.filteredData = this.data.filter(item => {
            return Object.keys(filters).every(key => {
                const filterValue = filters[key];
                if (!filterValue) return true;
                
                const itemValue = item[key];
                if (typeof itemValue === 'string') {
                    return itemValue.toLowerCase().includes(filterValue.toLowerCase());
                }
                return itemValue.toString().includes(filterValue);
            });
        });
        
        // 重置滚动位置
        this.scrollTop = 0;
        this.scrollLeft = 0;
        
        this.updateDimensions();
        this.calculateVisibleRange();
    }
    
    /**
     * 处理垂直滚动
     */
    handleVerticalScroll(scrollTop) {
        const maxScrollTop = Math.max(0, this.totalHeight - this.containerHeight);
        this.scrollTop = Math.max(0, Math.min(scrollTop, maxScrollTop));
        
        this.calculateVisibleRange();
        this.onScroll({
            scrollTop: this.scrollTop,
            scrollLeft: this.scrollLeft,
            maxScrollTop,
            maxScrollLeft: Math.max(0, this.totalWidth - this.containerWidth)
        });
    }
    
    /**
     * 处理水平滚动
     */
    handleHorizontalScroll(scrollLeft) {
        const maxScrollLeft = Math.max(0, this.totalWidth - this.containerWidth);
        this.scrollLeft = Math.max(0, Math.min(scrollLeft, maxScrollLeft));
        
        this.onScroll({
            scrollTop: this.scrollTop,
            scrollLeft: this.scrollLeft,
            maxScrollTop: Math.max(0, this.totalHeight - this.containerHeight),
            maxScrollLeft
        });
    }
    
    /**
     * 滚动到指定位置
     */
    scrollTo(scrollTop, scrollLeft) {
        if (scrollTop !== undefined) {
            this.handleVerticalScroll(scrollTop);
        }
        if (scrollLeft !== undefined) {
            this.handleHorizontalScroll(scrollLeft);
        }
    }
    
    /**
     * 滚动到指定行
     */
    scrollToRow(rowIndex) {
        const scrollTop = rowIndex * this.rowHeight;
        this.handleVerticalScroll(scrollTop);
    }
    
    /**
     * 获取滚动信息
     */
    getScrollInfo() {
        return {
            scrollTop: this.scrollTop,
            scrollLeft: this.scrollLeft,
            maxScrollTop: Math.max(0, this.totalHeight - this.containerHeight),
            maxScrollLeft: Math.max(0, this.totalWidth - this.containerWidth),
            totalHeight: this.totalHeight,
            totalWidth: this.totalWidth,
            containerHeight: this.containerHeight,
            containerWidth: this.containerWidth,
            visibleRowCount: this.visibleRowCount,
            startIndex: this.startIndex,
            endIndex: this.endIndex,
            totalRows: this.filteredData.length
        };
    }
    
    /**
     * 获取可见列范围
     */
    getVisibleColumns() {
        let startColumnIndex = 0;
        let endColumnIndex = this.columns.length;
        let currentX = 0;
        
        // 找到开始列
        for (let i = 0; i < this.columns.length; i++) {
            if (currentX + this.columns[i].width > this.scrollLeft) {
                startColumnIndex = i;
                break;
            }
            currentX += this.columns[i].width;
        }
        
        // 找到结束列
        currentX = 0;
        for (let i = 0; i < this.columns.length; i++) {
            if (i < startColumnIndex) {
                currentX += this.columns[i].width;
                continue;
            }
            
            if (currentX > this.containerWidth + this.scrollLeft) {
                endColumnIndex = i;
                break;
            }
            currentX += this.columns[i].width;
        }
        
        return {
            startColumnIndex,
            endColumnIndex,
            visibleColumns: this.columns.slice(startColumnIndex, endColumnIndex)
        };
    }
    
    /**
     * 销毁
     */
    destroy() {
        this.data = [];
        this.filteredData = [];
        this.container = null;
        this.onScroll = null;
        this.onDataChange = null;
    }
}

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VirtualScrollManager;
}