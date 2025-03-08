class ExternalModule {
  constructor(request) {
    // 模块的请求路径，例如 'path', 'lodash' 等
    this.request = request;
    // 模块类型
    this.type = 'external';
    // 模块导出对象
    this.exports = null;
  }

  // 加载外部模块
  load() {
    try {
      // 使用 require 加载外部模块
      this.exports = require(this.request);
      return true;
    } catch (error) {
      console.error(`无法加载外部模块 ${this.request}:`, error);
      return false;
    }
  }

  // 生成该模块的代码
  generate() {
    // 为外部模块创建一个包装函数
    return `
      module.exports = require("${this.request}");
    `;
  }

  // 获取模块的依赖
  getDependencies() {
    // 外部模块通常不需要解析其内部依赖
    return [];
  }

  // 获取模块标识符
  identifier() {
    return `external "${this.request}"`;
  }
}

module.exports = ExternalModule;
