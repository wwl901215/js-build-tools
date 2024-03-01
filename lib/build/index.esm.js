import * as babel from '@babel/core';
import * as fs from 'fs';
import * as readline from 'node:readline';
import * as prettier from 'prettier';
import path from 'path';
import postcss from 'postcss';

function modifyVarPlugin (babel, options, _dirname) {
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

function modifyProjectPlugin (_babel, options, _dirname) {
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

function handle(params) {
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

var name = "@wwl/babel-tools";
var version = "0.0.1";

/**
 * 修改文件中的变量，一般用于切换非标准工程的环境等场景
 * @param varConfig type {}
 * @param {filePath, varConfig} opt
 */
async function modifyFileVar(opt) {
  const transformedCode = babel.transformFileSync(opt.filePath, {
    configFile: false,
    plugins: [[modifyVarPlugin, opt.varConfig]],
  }).code;

  const formatCode = await prettier.format(transformedCode, {
    semi: false,
    singleQuote: true,
    parser: "babel",
  });

  fs.writeFileSync(opt.filePath, formatCode, "utf8");
}

/**
 * 缺点：相同的key值 会全部被替换，且 是异步完成
 * @param {String} filePath
 * @param {Object} config
 */
function modifyJsonFile(filePath, config) {
  const input = fs.createReadStream(filePath);
  const tempPath = path.resolve(process.cwd(), `${new Date().getTime()}.json`);
  const output = fs.createWriteStream(tempPath);
  const rl = readline.createInterface({
    input: input,
  });
  rl.on("line", (line) => {
    if (line && line.trimStart().startsWith(`"${config.k}":`)) {
      const pattern = `\"${config.k}\": \"(.*?)\",`;
      const reg = new RegExp(pattern, "g");
      line = line.replace(reg, `"${config.k}": "${config.v}",`);
    }
    output.write(Buffer.from(line + "\n"));
  });
  rl.addListener("close", () => {
    input.close();
    output.close();
    fs.rmSync(filePath);
    fs.renameSync(tempPath, filePath);
  });
}

function modifyProjectFile(filePath) {
  console.log("modifyProjectFile:" + filePath);

  const oldFileText = fs.readFileSync(filePath);
  const tempText = `let tempV = ${oldFileText};exports.b = b;`;
  const newFileText = babel.transformSync(tempText, {
    configFile: false,
    plugins: [[modifyProjectPlugin, { appid: "555" }]],
  }).code;
  const tempPath = path.resolve(process.cwd(), `${new Date().getTime()}.js`);
  fs.writeFileSync(tempPath, newFileText, "utf8");
  const result = require(`./${tempPath}`).tempV;
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2), "utf8");
}


async function modifyWXSSImport(filePath, params) {
  if (filePath && Array.isArray(params) && params.length > 0) {
    const originFile = fs.readFileSync(filePath);
    const result = await postcss([handle(params)]).process(originFile, {from: '', to: ''});
    fs.writeFileSync(filePath, result.css);
  }
}

function getPackageInfo() {
  return {version, name}
}

export { getPackageInfo, modifyFileVar, modifyJsonFile, modifyProjectFile, modifyWXSSImport };
