/**
 * 作用域类，用于管理变量和作用域信息
 */
class Scope {
  /**
   * @param {Object} options - 作用域选项
   * @param {Scope} options.parent - 父作用域
   * @param {Object} options.node - 关联的 AST 节点
   * @param {string} options.type - 作用域类型（'program', 'function', 'block'）
   */
  constructor(options = {}) {
    // 父级作用域
    this.parent = options.parent;
    // 关联的 AST 节点
    this.node = options.node;
    // 作用域类型
    this.type = options.type || 'block';
    // 作用域内的变量声明
    this.declarations = new Map();
    // 作用域内的引用
    this.references = new Map();
    // 子作用域
    this.children = new Set();
    
    // 将当前作用域添加到父作用域的子作用域集合中
    if (this.parent) {
      this.parent.children.add(this);
    }
  }

  /**
   * 添加变量声明
   * @param {string} name - 变量名
   * @param {Object} node - 变量声明节点
   */
  addDeclaration(name, node) {
    this.declarations.set(name, {
      name,
      node,
      scope: this,
      // 记录变量是否被修改
      modified: false,
      // 记录变量的引用次数
      references: 0
    });
  }

  /**
   * 添加变量引用
   * @param {string} name - 变量名
   * @param {Object} node - 引用节点
   * @param {boolean} isWrite - 是否是写操作
   */
  addReference(name, node, isWrite = false) {
    if (!this.references.has(name)) {
      this.references.set(name, []);
    }
    
    this.references.get(name).push({
      node,
      isWrite,
      scope: this
    });

    // 更新声明的引用计数
    const declaration = this.findDeclaration(name);
    if (declaration) {
      declaration.references++;
      if (isWrite) {
        declaration.modified = true;
      }
    }
  }

  /**
   * 在作用域链中查找变量声明
   * @param {string} name - 变量名
   * @returns {Object|null} 变量声明信息
   */
  findDeclaration(name) {
    // 首先在当前作用域中查找
    if (this.declarations.has(name)) {
      return this.declarations.get(name);
    }
    
    // 如果在当前作用域中没有找到，则在父作用域中查找
    if (this.parent) {
      return this.parent.findDeclaration(name);
    }
    
    return null;
  }

  /**
   * 获取所有变量声明
   * @returns {Map} 变量声明映射
   */
  getAllDeclarations() {
    const declarations = new Map(this.declarations);
    
    // 如果是块级作用域，合并父作用域的声明
    if (this.parent) {
      this.parent.getAllDeclarations().forEach((decl, name) => {
        if (!declarations.has(name)) {
          declarations.set(name, decl);
        }
      });
    }
    
    return declarations;
  }

  /**
   * 判断变量是否在当前作用域中已声明
   * @param {string} name - 变量名
   * @returns {boolean}
   */
  hasOwnDeclaration(name) {
    return this.declarations.has(name);
  }

  /**
   * 获取作用域链上的所有未解析的引用
   * @returns {Array} 未解析的引用列表
   */
  getUnresolvedReferences() {
    const unresolved = [];
    
    this.references.forEach((refs, name) => {
      if (!this.findDeclaration(name)) {
        unresolved.push(...refs);
      }
    });
    
    return unresolved;
  }
}

module.exports = Scope;
