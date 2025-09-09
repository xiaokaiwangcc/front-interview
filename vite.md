### vite

#### 基础使用与原理
parcel对比 vite更倾向于零配置
<!-- webpack 入口、解析、出口、loader、plugin -->

#### 入口
vite 第一性,默许开发者开发web应用将index.html中的type="module" src="xxx" 作为入口文件

#### 模块解析
- 针对js、ts的处理，vite在开发环境使用esbuild构建的，很多编译工作采用esbuild（go）完成
- 样式文件，vite单独使用postcss相关内容处理

按照需要进行编译，并将编辑结果缓存

#### 另外配置
- 针对功能增强，plugins配置
- 模块解析，resolve
- 本地开发构建服务，server
- 样式额外处理，css配置
- 一些vite环境变量 define配置
  - .env来管理环境变量,但是必须VITE_开头
  - 可以通过import.meta.env来访问
- 产物构建 build esbuild配置

#### Vite插件
Vite插件和webpack插件，webpack插件主要是强化构建过程，通过暴露的插件时机钩子在不同时机做处理，loader区分开，loader的工作是模块编译与解析

原理核心概念
- Vite plugin是一个函数，可以覆盖原有配置
- 插件处理配置问题
- 插件处理编译工作
- 插件处理编译内容输出

### Vite原理
- 借助浏览器的module支持
- 需要编译的内容做额外的编译处理
  - css
  - ts
- 两端
  - 开发阶段本地通过开发服务借助esbuild实现
  - rollup打包处理


### Webpack

#### 基础概念
- webpack是一个js打打包工具，可以用nodejs来运行也可以用cli来启动

#### 入口配置（entry）
- 单入口
- 多入口
- 对象形式

#### 输出配置(output)
- 输出位置：path
- 输出文件名： filename
- 输出chunk chunkFileName
- 清除：clean
- 环境配置：environment:arrowFunction、asyncFunction
  为了让浏览器应用发布后第一次不走缓存，会将文件打包时输出文件名加hash

#### 模块解析（module）
- 针对不同类型的文件，做转换处理
- js -> babel-loader
- ts -> ts-loader
- css -> css-loader、style-loader
- image -> url-loader、raw-loader
- font -> raw-loader
- file -> raw-loader

#### 辅助解析（resolve）
- extensions 省略模块后缀