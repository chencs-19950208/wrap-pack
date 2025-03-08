class Bundle {
  constructor(entry) {
    // 入口文件路径
    this.entry = entry;
    // 存储所有模块的信息
    this.modules = new Map();
  }

  // 添加模块
  addModule(filePath, code) {
    this.modules.set(filePath, {
      code,
      dependencies: new Set()
    });
  }

  // 添加依赖关系
  addDependency(moduleFile, dependencyFile) {
    const module = this.modules.get(moduleFile);
    if (module) {
      module.dependencies.add(dependencyFile);
    }
  }

  // 生成最终的打包代码
  generate() {
    let bundleCode = '';
    
    // 模块代码包装函数
    bundleCode += '(function(modules) {\n';
    bundleCode += '  function require(moduleId) {\n';
    bundleCode += '    const module = { exports: {} };\n';
    bundleCode += '    modules[moduleId](module, module.exports, require);\n';
    bundleCode += '    return module.exports;\n';
    bundleCode += '  }\n\n';
    
    // 添加所有模块的代码
    const modulesStr = Array.from(this.modules.entries())
      .map(([path, module]) => {
        return `  "${path}": function(module, exports, require) {\n    ${module.code}\n  }`;
      })
      .join(',\n');
    
    bundleCode += `  const modules = {\n${modulesStr}\n  };\n\n`;
    
    // 从入口文件开始执行
    bundleCode += `  require("${this.entry}");\n`;
    bundleCode += '})({});';
    
    return bundleCode;
  }
}

module.exports = Bundle;

