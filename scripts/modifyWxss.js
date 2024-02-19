import { modifyWXSSImport } from "../build/modifyFile.js";
import path from "path";

const filePath = path.resolve(process.cwd(), "example/app.wxss");
modifyWXSSImport(filePath, ['aaa.wxss', 'bbb.wxss']);
