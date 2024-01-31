import * as babel from "@babel/core";
import * as fs from "fs";
import * as readline from "node:readline";
import * as prettier from "prettier";
import modifyVarPlugin from "./plugins/modifyVarPlugin.js";
import path from "path";

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
  console.log('modifyProjectFile:' + filePath)
    //  读取原来文件内容
    const oldContent = fs.readFileSync(filePath);
    //  强行转换成js文件
    const addContent = 'let b=' + oldContent + ';exports.b = b;';
    console.log(addContent)
}