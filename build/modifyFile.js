import * as babel from "@babel/core";
import * as fs from "fs";
import * as readline from "node:readline";
import * as prettier from "prettier";
import modifyVarPlugin from "./plugins/modifyVarPlugin.js";
import path from "path";
import modifyProjectPlugin from "./plugins/modifyProjectPlugin.js";
import postcss from "postcss";
import postcssChangeImport from "./plugins/postcss-change-import.js"
import { version, name } from "../package.json"

/**
 * 修改文件中的变量，一般用于切换非标准工程的环境等场景
 * @param varConfig type {}
 * @param {filePath, varConfig} opt
 */
export async function modifyFileVar(opt) {
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
export function modifyJsonFile(filePath, config) {
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

export function modifyProjectFile(filePath) {
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


export async function modifyWXSSImport(filePath, params) {
  if (filePath && Array.isArray(params) && params.length > 0) {
    const originFile = fs.readFileSync(filePath)
    const result = await postcss([postcssChangeImport(params)]).process(originFile, {from: '', to: ''})
    fs.writeFileSync(filePath, result.css)
  }
}

export function getPackageInfo() {
  return {version, name}
}