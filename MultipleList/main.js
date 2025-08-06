/**
 * 主入口文件 - 初始化高性能表格组件
 */
class App {
    constructor() {
        this.tableManager = null;
        this.isInitialized = false;
    }
    
    /**
     * 初始化应用
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            // 获取DOM元素
            const elements = this.getDOMElements();
            
            if (!this.validateElements(elements)) {
                throw new Error('必要的DOM元素未找到');
            }
            
            // 初始化表格管理器
            this.tableManager = new TableManager({
                container: elements.tableContainer,
                canvasContainer: elements.canvasContainer,
                svgContainer: elements.svgContainer,
                canvas: elements.canvas,
                svg: elements.svg
            });
            
            this.isInitialized = true;
            
            console.log('高性能表格组件初始化成功');
            
            // 显示欢迎信息
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showErrorMessage('应用初始化失败: ' + error.message);
        }
    }
    
    /**
     * 获取DOM元素
     */
    getDOMElements() {
        return {
            tableContainer: document.getElementById('tableContainer'),
            canvasContainer: document.getElementById('canvasContainer'),
            svgContainer: document.getElementById('svgContainer'),
            canvas: document.getElementById('tableCanvas'),
            svg: document.getElementById('tableSvg')
        };
    }
    
    /**
     * 验证DOM元素
     */
    validateElements(elements) {
        const requiredElements = [
            'tableContainer',
            'canvasContainer', 
            'svgContainer',
            'canvas',
            'svg'
        ];
        
        for (const elementName of requiredElements) {
            if (!elements[elementName]) {
                console.error(`缺少必要的DOM元素: ${elementName}`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 显示欢迎信息
     */
    showWelcomeMessage() {
        const message = `
🎉 高性能表格组件已就绪！

✨ 功能特性:
• 支持10万+数据量的流畅渲染
• Canvas和SVG双渲染引擎
• 虚拟滚动技术优化性能
• 实时搜索和过滤功能
• 响应式设计适配各种屏幕

🚀 快速开始:
1. 点击"生成测试数据"按钮创建10万条数据
2. 尝试在搜索框中输入关键词进行过滤
3. 切换Canvas/SVG渲染模式对比性能
4. 使用鼠标滚轮或滚动条浏览数据

💡 性能提示:
• Canvas渲染通常在大数据量下性能更优
• SVG渲染在交互性和可访问性方面更好
• 虚拟滚动确保只渲染可见区域的数据
        `;
        
        console.log(message);
    }
    
    /**
     * 显示错误信息
     */
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f8d7da;
            color: #721c24;
            padding: 20px;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 500px;
            text-align: center;
            font-family: "Segoe UI", sans-serif;
        `;
        
        errorDiv.innerHTML = `
            <h3 style="margin: 0 0 10px 0;">❌ 错误</h3>
            <p style="margin: 0 0 15px 0;">${message}</p>
            <button onclick="this.parentElement.remove()" style="
                background: #721c24;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            ">确定</button>
        `;
        
        document.body.appendChild(errorDiv);
        
        // 5秒后自动移除
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    /**
     * 销毁应用
     */
    destroy() {
        if (this.tableManager) {
            this.tableManager.destroy();
            this.tableManager = null;
        }
        
        this.isInitialized = false;
        console.log('应用已销毁');
    }
    
    /**
     * 重新初始化
     */
    reinit() {
        this.destroy();
        setTimeout(() => {
            this.init();
        }, 100);
    }
}

/**
 * 性能监控工具
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            renderTimes: [],
            scrollEvents: 0,
            filterEvents: 0,
            memoryUsage: []
        };
        
        this.startTime = performance.now();
        this.isMonitoring = false;
    }
    
    /**
     * 开始监控
     */
    start() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.startTime = performance.now();
        
        // 监控内存使用情况
        this.memoryInterval = setInterval(() => {
            if (performance.memory) {
                this.metrics.memoryUsage.push({
                    timestamp: performance.now(),
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                });
                
                // 只保留最近100个记录
                if (this.metrics.memoryUsage.length > 100) {
                    this.metrics.memoryUsage.shift();
                }
            }
        }, 1000);
        
        console.log('性能监控已启动');
    }
    
    /**
     * 停止监控
     */
    stop() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        
        if (this.memoryInterval) {
            clearInterval(this.memoryInterval);
        }
        
        console.log('性能监控已停止');
    }
    
    /**
     * 记录渲染时间
     */
    recordRenderTime(time) {
        this.metrics.renderTimes.push(time);
        
        // 只保留最近50个记录
        if (this.metrics.renderTimes.length > 50) {
            this.metrics.renderTimes.shift();
        }
    }
    
    /**
     * 记录滚动事件
     */
    recordScrollEvent() {
        this.metrics.scrollEvents++;
    }
    
    /**
     * 记录过滤事件
     */
    recordFilterEvent() {
        this.metrics.filterEvents++;
    }
    
    /**
     * 获取性能报告
     */
    getReport() {
        const renderTimes = this.metrics.renderTimes;
        const avgRenderTime = renderTimes.length > 0 
            ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length 
            : 0;
        
        const maxRenderTime = renderTimes.length > 0 
            ? Math.max(...renderTimes) 
            : 0;
        
        const minRenderTime = renderTimes.length > 0 
            ? Math.min(...renderTimes) 
            : 0;
        
        const currentMemory = this.metrics.memoryUsage.length > 0 
            ? this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1]
            : null;
        
        return {
            uptime: performance.now() - this.startTime,
            rendering: {
                averageTime: Math.round(avgRenderTime * 100) / 100,
                maxTime: Math.round(maxRenderTime * 100) / 100,
                minTime: Math.round(minRenderTime * 100) / 100,
                totalRenders: renderTimes.length
            },
            events: {
                scrollEvents: this.metrics.scrollEvents,
                filterEvents: this.metrics.filterEvents
            },
            memory: currentMemory ? {
                used: Math.round(currentMemory.used / 1024 / 1024 * 100) / 100 + ' MB',
                total: Math.round(currentMemory.total / 1024 / 1024 * 100) / 100 + ' MB',
                usage: Math.round((currentMemory.used / currentMemory.total) * 100) + '%'
            } : null
        };
    }
    
    /**
     * 打印性能报告
     */
    printReport() {
        const report = this.getReport();
        
        console.group('📊 性能监控报告');
        console.log('⏱️ 运行时间:', Math.round(report.uptime / 1000) + '秒');
        
        console.group('🎨 渲染性能');
        console.log('平均渲染时间:', report.rendering.averageTime + 'ms');
        console.log('最大渲染时间:', report.rendering.maxTime + 'ms');
        console.log('最小渲染时间:', report.rendering.minTime + 'ms');
        console.log('总渲染次数:', report.rendering.totalRenders);
        console.groupEnd();
        
        console.group('📱 事件统计');
        console.log('滚动事件:', report.events.scrollEvents);
        console.log('过滤事件:', report.events.filterEvents);
        console.groupEnd();
        
        if (report.memory) {
            console.group('💾 内存使用');
            console.log('已使用:', report.memory.used);
            console.log('总分配:', report.memory.total);
            console.log('使用率:', report.memory.usage);
            console.groupEnd();
        }
        
        console.groupEnd();
    }
}

// 全局实例
let app = null;
let performanceMonitor = null;

/**
 * DOM加载完成后初始化应用
 */
document.addEventListener('DOMContentLoaded', () => {
    // 创建应用实例
    app = new App();
    
    // 创建性能监控实例
    performanceMonitor = new PerformanceMonitor();
    
    // 初始化应用
    app.init();
    
    // 启动性能监控
    performanceMonitor.start();
    
    // 添加全局快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+P: 打印性能报告
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            performanceMonitor.printReport();
        }
        
        // Ctrl+Shift+R: 重新初始化应用
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            app.reinit();
        }
    });
    
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
        if (performanceMonitor) {
            performanceMonitor.stop();
        }
        
        if (app) {
            app.destroy();
        }
    });
    
    // 暴露到全局作用域供调试使用
    window.tableApp = {
        app,
        performanceMonitor,
        reinit: () => app.reinit(),
        getPerformanceReport: () => performanceMonitor.getReport(),
        printPerformanceReport: () => performanceMonitor.printReport()
    };
    
    console.log('💡 调试提示:');
    console.log('• 使用 window.tableApp 访问应用实例');
    console.log('• 按 Ctrl+Shift+P 查看性能报告');
    console.log('• 按 Ctrl+Shift+R 重新初始化应用');
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('全局错误:', e.error);
    
    if (app) {
        app.showErrorMessage('发生未预期的错误: ' + e.error.message);
    }
});

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise拒绝:', e.reason);
    
    if (app) {
        app.showErrorMessage('异步操作失败: ' + e.reason);
    }
});