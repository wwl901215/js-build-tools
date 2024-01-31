import { modifyFileVar } from "../build/modifyFile.js";
import minimist from "minimist";
import path from "path";

const args = minimist(process.argv.slice(2));

const argOpt = {
  filePath: path.resolve(process.cwd(), "example/envconfig.js"),
  varConfig: {
    NODE_ENV: args.env,
    name: args.name,
  },
};

modifyFileVar(argOpt);
