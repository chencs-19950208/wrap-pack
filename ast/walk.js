/**
 * 递归遍历 AST 节点
 * @param {Object} node - AST 节点
 * @param {Object} visitors - 访问者对象，包含不同节点类型的处理函数
 * @param {Object} parent - 父节点
 */
function walk(node, visitors, parent = null) {
  // 如果节点不存在，直接返回
  if (!node) return;

  // 获取节点类型对应的处理函数
  const visitor = visitors[node.type];
  
  // 如果存在对应的处理函数，则调用
  if (visitor) {
    visitor(node, parent);
  }

  // 遍历节点的子节点
  Object.keys(node).forEach(key => {
    const value = node[key];

    // 跳过非对象属性
    if (typeof value !== 'object') return;

    // 处理数组类型的子节点
    if (Array.isArray(value)) {
      value.forEach(child => {
        if (child && typeof child.type === 'string') {
          walk(child, visitors, node);
        }
      });
    } 
    // 处理单个子节点
    else if (value && typeof value.type === 'string') {
      walk(value, visitors, node);
    }
  });

  // 处理节点的退出
  const exitVisitor = visitors[`${node.type}:exit`];
  if (exitVisitor) {
    exitVisitor(node, parent);
  }
}

module.exports = walk;

// AST 节点类型示例：
/*
Program: 程序的根节点
{
  type: 'Program',
  body: [...]
}

VariableDeclaration: 变量声明
{
  type: 'VariableDeclaration',
  declarations: [...]
}

FunctionDeclaration: 函数声明
{
  type: 'FunctionDeclaration',
  id: { type: 'Identifier', name: 'foo' },
  params: [...],
  body: { type: 'BlockStatement', body: [...] }
}

CallExpression: 函数调用
{
  type: 'CallExpression',
  callee: { type: 'Identifier', name: 'require' },
  arguments: [...]
}
*/
