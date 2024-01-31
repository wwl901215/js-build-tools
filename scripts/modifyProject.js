import { modifyProjectFile } from "../build/modifyFile.js";
import path from "path";

const filePath = path.resolve(process.cwd(), "example/project.config.json");
modifyProjectFile(filePath);
