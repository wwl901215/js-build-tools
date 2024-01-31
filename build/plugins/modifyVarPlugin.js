export default function (babel, options, _dirname) {
  console.log("---------VariableDeclarator----------");
  return {
    visitor: {
      VariableDeclarator(path) {
        // path.node 获取当前path下的node节点；
        // path.scope 作用域
        // path.toString() 当前路径的源代码
        const node = path.node;
        console.log(node.id.name);
        const isKeyExist = Object.keys(options).includes(node.id.name);
        if (isKeyExist) {
          node.init.value = options[node.id.name];
        }
      },
    },
  };
}
