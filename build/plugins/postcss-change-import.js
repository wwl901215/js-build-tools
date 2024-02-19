export default function handle(params) {
    let i = 0;
    return {
        postcssPlugin: "postcss-change-import",
        AtRule: {
          import: (atRule) => {
            if (params[i]) {
              atRule.params = "'" + `${params[i]}` + "'";
              i++;
            }
          },
        },
    };
}

handle.postcss = true;
