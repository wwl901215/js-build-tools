export default function (_babel, options, _dirname) {
  return {
    visitor: {
      ObjectProperty(path) {
        const parents = path.parentPath.parent;
        const node = path.node;
        if (
          parents.type === "VariableDeclarator" &&
          Object.keys(options).includes(node.key.value)
        ) {
          node.value.value = options[node.key.value];
        }
      },
    },
  };
}
