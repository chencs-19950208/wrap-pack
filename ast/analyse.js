const walk = require('./walk');

class Analyse {
  constructor() {
    // 存储作用域信息
    this.scopes = new Map();
    // 存储当前作用域
    this.currentScope = null;
    // 存储依赖项
    this.dependencies = new Set();
  }

  // 创建新的作用域
  createScope(node) {
    const scope = {
      // 作用域内的变量声明
      declarations: new Map(),
      // 父级作用域
      parent: this.currentScope,
      // AST节点
      node: node
    };
    this.scopes.set(node, scope);
    this.currentScope = scope;
    return scope;
  }

  // 添加变量声明到当前作用域
  addDeclaration(name, node) {
    if (this.currentScope) {
      this.currentScope.declarations.set(name, node);
    }
  }

  // 在作用域链中查找变量声明
  findDeclaration(name) {
    let scope = this.currentScope;
    while (scope) {
      if (scope.declarations.has(name)) {
        return scope.declarations.get(name);
      }
      scope = scope.parent;
    }
    return null;
  }

  // 分析 AST 节点
  analyse(ast) {
    // 创建全局作用域
    const globalScope = this.createScope(ast);

    // 遍历 AST
    walk(ast, {
      // 处理变量声明
      VariableDeclaration: (node) => {
        node.declarations.forEach(declarator => {
          if (declarator.id.type === 'Identifier') {
            this.addDeclaration(declarator.id.name, declarator);
          }
        });
      },

      // 处理函数声明
      FunctionDeclaration: (node) => {
        // 在当前作用域中添加函数名
        if (node.id) {
          this.addDeclaration(node.id.name, node);
        }
        
        // 为函数创建新的作用域
        const scope = this.createScope(node);
        
        // 添加参数到函数作用域
        node.params.forEach(param => {
          if (param.type === 'Identifier') {
            this.addDeclaration(param.name, param);
          }
        });
      },

      // 处理 require 调用
      CallExpression: (node) => {
        if (node.callee.type === 'Identifier' && 
            node.callee.name === 'require' && 
            node.arguments.length === 1 && 
            node.arguments[0].type === 'Literal') {
          // 添加依赖项
          this.dependencies.add(node.arguments[0].value);
        }
      },

      // 处理作用域退出
      'FunctionDeclaration:exit': () => {
        this.currentScope = this.currentScope.parent;
      }
    });

    return {
      scopes: this.scopes,
      dependencies: Array.from(this.dependencies)
    };
  }

  // 获取节点所在的作用域
  getScope(node) {
    return this.scopes.get(node);
  }
}

module.exports = Analyse;
