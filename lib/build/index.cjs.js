'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var babel = require('@babel/core');
var fs = require('fs');
var readline = require('node:readline');
var prettier = require('prettier');
var path = require('path');
var postcss = require('postcss');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var babel__namespace = /*#__PURE__*/_interopNamespace(babel);
var fs__namespace = /*#__PURE__*/_interopNamespace(fs);
var readline__namespace = /*#__PURE__*/_interopNamespace(readline);
var prettier__namespace = /*#__PURE__*/_interopNamespace(prettier);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);

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
  const transformedCode = babel__namespace.transformFileSync(opt.filePath, {
    configFile: false,
    plugins: [[modifyVarPlugin, opt.varConfig]],
  }).code;

  const formatCode = await prettier__namespace.format(transformedCode, {
    semi: false,
    singleQuote: true,
    parser: "babel",
  });

  fs__namespace.writeFileSync(opt.filePath, formatCode, "utf8");
}

/**
 * 缺点：相同的key值 会全部被替换，且 是异步完成
 * @param {String} filePath
 * @param {Object} config
 */
function modifyJsonFile(filePath, config) {
  const input = fs__namespace.createReadStream(filePath);
  const tempPath = path__default["default"].resolve(process.cwd(), `${new Date().getTime()}.json`);
  const output = fs__namespace.createWriteStream(tempPath);
  const rl = readline__namespace.createInterface({
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
    fs__namespace.rmSync(filePath);
    fs__namespace.renameSync(tempPath, filePath);
  });
}

function modifyProjectFile(filePath) {
  console.log("modifyProjectFile:" + filePath);

  const oldFileText = fs__namespace.readFileSync(filePath);
  const tempText = `let tempV = ${oldFileText};exports.b = b;`;
  const newFileText = babel__namespace.transformSync(tempText, {
    configFile: false,
    plugins: [[modifyProjectPlugin, { appid: "555" }]],
  }).code;
  const tempPath = path__default["default"].resolve(process.cwd(), `${new Date().getTime()}.js`);
  fs__namespace.writeFileSync(tempPath, newFileText, "utf8");
  const result = require(`./${tempPath}`).tempV;
  fs__namespace.writeFileSync(filePath, JSON.stringify(result, null, 2), "utf8");
}


async function modifyWXSSImport(filePath, params) {
  if (filePath && Array.isArray(params) && params.length > 0) {
    const originFile = fs__namespace.readFileSync(filePath);
    const result = await postcss__default["default"]([handle(params)]).process(originFile, {from: '', to: ''});
    fs__namespace.writeFileSync(filePath, result.css);
  }
}

function getPackageInfo() {
  return {version, name}
}

exports.getPackageInfo = getPackageInfo;
exports.modifyFileVar = modifyFileVar;
exports.modifyJsonFile = modifyJsonFile;
exports.modifyProjectFile = modifyProjectFile;
exports.modifyWXSSImport = modifyWXSSImport;
