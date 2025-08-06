/**
 * 数据生成器 - 生成大量测试数据
 */
class DataGenerator {
    constructor() {
        this.firstNames = [
            '张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴',
            '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗',
            '郑', '梁', '谢', '宋', '唐', '许', '邓', '冯', '韩', '曹'
        ];
        
        this.lastNames = [
            '伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋',
            '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '霞', '平',
            '刚', '桂英', '建华', '文', '华', '金凤', '素梅', '建国', '丽娟', '秀兰'
        ];
        
        this.departments = [
            '技术部', '产品部', '设计部', '运营部', '市场部', '销售部',
            '人事部', '财务部', '法务部', '行政部', '客服部', '质量部'
        ];
        
        this.cities = [
            '北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都',
            '西安', '重庆', '天津', '苏州', '长沙', '郑州', '青岛', '大连',
            '宁波', '厦门', '福州', '无锡', '合肥', '昆明', '哈尔滨', '济南',
            '佛山', '长春', '温州', '石家庄', '南宁', '贵阳'
        ];
        
        this.positions = [
            '前端工程师', '后端工程师', '全栈工程师', '产品经理', '设计师',
            '运营专员', '市场专员', '销售代表', '人事专员', '财务专员',
            '项目经理', '测试工程师', '数据分析师', '架构师', '技术总监'
        ];
        
        this.experienceTemplates = [
            '在{company}担任{position}，负责{responsibility}，期间{achievement}。',
            '曾就职于{company}，从事{position}工作，主要{responsibility}，成功{achievement}。',
            '在{company}工作期间，作为{position}，专注于{responsibility}，并{achievement}。',
            '担任{company}的{position}职位，主要负责{responsibility}，取得了{achievement}的成果。'
        ];
        
        this.companies = [
            '阿里巴巴', '腾讯', '百度', '字节跳动', '美团', '滴滴出行', '京东', '网易',
            '新浪', '搜狐', '360', '小米', '华为', '中兴', '联想', '海尔', '格力',
            '比亚迪', '万科', '恒大', '中国平安', '招商银行', '工商银行', '建设银行',
            '中国移动', '中国联通', '中国电信', '国家电网', '中石油', '中石化'
        ];
        
        this.responsibilities = [
            '系统架构设计与优化', '团队管理与项目协调', '产品需求分析与设计',
            '前端界面开发与维护', '后端服务开发与部署', '数据库设计与优化',
            '用户体验研究与改进', '市场推广与品牌建设', '客户关系维护与拓展',
            '财务分析与成本控制', '人力资源管理与培训', '质量控制与流程改进',
            '技术研发与创新', '运营策略制定与执行', '商务合作与谈判'
        ];
        
        this.achievements = [
            '提升系统性能30%以上', '成功交付多个重要项目', '获得年度优秀员工称号',
            '带领团队完成技术升级', '实现用户增长50%', '降低运营成本20%',
            '建立完善的开发流程', '获得多项技术专利', '成功拓展新市场',
            '提升客户满意度至95%', '完成重要产品迭代', '建立高效团队协作机制',
            '实现营收目标超额完成', '优化业务流程效率', '获得行业认可奖项'
        ];
    }
    
    /**
     * 生成随机姓名
     */
    generateName() {
        const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
        const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
        return firstName + lastName;
    }
    
    /**
     * 生成随机部门
     */
    generateDepartment() {
        return this.departments[Math.floor(Math.random() * this.departments.length)];
    }
    
    /**
     * 生成随机城市
     */
    generateCity() {
        return this.cities[Math.floor(Math.random() * this.cities.length)];
    }
    
    /**
     * 生成随机职位
     */
    generatePosition() {
        return this.positions[Math.floor(Math.random() * this.positions.length)];
    }
    
    /**
     * 生成随机薪资
     */
    generateSalary() {
        return Math.floor(Math.random() * 50000) + 5000; // 5000-55000
    }
    
    /**
     * 生成随机年龄
     */
    generateAge() {
        return Math.floor(Math.random() * 40) + 22; // 22-62
    }
    
    /**
     * 生成随机加入日期
     */
    generateJoinDate() {
        const start = new Date(2015, 0, 1);
        const end = new Date();
        const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return date.toISOString().split('T')[0];
    }
    
    /**
     * 生成过往经历（大约1000字）
     */
    generateExperience() {
        const experienceCount = Math.floor(Math.random() * 3) + 3; // 3-5段经历
        const experiences = [];
        
        for (let i = 0; i < experienceCount; i++) {
            const template = this.experienceTemplates[Math.floor(Math.random() * this.experienceTemplates.length)];
            const company = this.companies[Math.floor(Math.random() * this.companies.length)];
            const position = this.positions[Math.floor(Math.random() * this.positions.length)];
            const responsibility = this.responsibilities[Math.floor(Math.random() * this.responsibilities.length)];
            const achievement = this.achievements[Math.floor(Math.random() * this.achievements.length)];
            
            let experience = template
                .replace('{company}', company)
                .replace('{position}', position)
                .replace('{responsibility}', responsibility)
                .replace('{achievement}', achievement);
            
            // 随机添加一些详细描述来增加字数
            const details = [
                '在此期间，积累了丰富的行业经验，深入了解了业务流程和技术架构。',
                '通过不断学习和实践，提升了专业技能和团队协作能力。',
                '参与了多个重要项目的规划、设计和实施，获得了宝贵的项目管理经验。',
                '与跨部门团队密切合作，建立了良好的沟通协调机制。',
                '持续关注行业发展趋势，积极引入新技术和最佳实践。',
                '在工作中展现出强烈的责任心和创新精神，得到了领导和同事的认可。',
                '通过持续改进和优化，为公司创造了显著的价值和效益。'
            ];
            
            if (Math.random() > 0.3) {
                const detail = details[Math.floor(Math.random() * details.length)];
                experience += detail;
            }
            
            experiences.push(experience);
        }
        
        return experiences.join(' ');
    }
    
    /**
     * 生成单条员工数据
     */
    generateEmployee(id) {
        return {
            id: id,
            name: this.generateName(),
            department: this.generateDepartment(),
            position: this.generatePosition(),
            city: this.generateCity(),
            age: this.generateAge(),
            salary: this.generateSalary(),
            joinDate: this.generateJoinDate(),
            email: `user${id}@company.com`,
            phone: `1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            experience: this.generateExperience()
        };
    }
    
    /**
     * 批量生成员工数据
     * @param {number} count 生成数量
     * @param {function} progressCallback 进度回调函数
     */
    async generateEmployees(count, progressCallback) {
        const employees = [];
        const batchSize = 1000; // 每批处理1000条
        
        for (let i = 0; i < count; i += batchSize) {
            const currentBatchSize = Math.min(batchSize, count - i);
            
            // 生成当前批次的数据
            for (let j = 0; j < currentBatchSize; j++) {
                employees.push(this.generateEmployee(i + j + 1));
            }
            
            // 报告进度
            if (progressCallback) {
                progressCallback({
                    current: i + currentBatchSize,
                    total: count,
                    percentage: Math.round(((i + currentBatchSize) / count) * 100)
                });
            }
            
            // 让出控制权，避免阻塞UI
            if (i + batchSize < count) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        
        return employees;
    }
    
    /**
     * 生成预设数量的测试数据
     */
    static async generateTestData(count = 1000000, progressCallback) {
        const generator = new DataGenerator();
        return await generator.generateEmployees(count, progressCallback);
    }
}

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataGenerator;
}