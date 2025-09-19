import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { fetchFile } from "../utils/fetchFile";



export async function init() {
    const answers = await inquirer.prompt<{
        configPath: string;
        globalCss: string;
    }>([
        {
            type: "input",
            name: "configPath",
            message: "Where do you want to keep dora-styles stuff?",
            default: "src/dora-styles",
        },
        {
            type: "input",
            name: "globalCss",
            message: "Where is your global.css located?",
            default: "src/styles/global.css",
        },
    ]);

    const projectRoot = process.cwd();
    const configPath = path.resolve(projectRoot, answers.configPath);
    const globalCssPath = path.resolve(projectRoot, answers.globalCss);

    await fs.ensureDir(configPath);

    const RAW_BASE =
        "https://raw.githubusercontent.com/Aayush-Rathore/dora-styles/dora-styles/packages/styles";

    const variablesPath = path.join(configPath, "variables.css");
    const utilsPath = path.join(configPath, "utils.css");
    const indexPath = path.join(configPath, "index.css");

    await fetchFile(`${RAW_BASE}/variables.css`, variablesPath);
    await fetchFile(`${RAW_BASE}/utils.css`, utilsPath);

    const indexCssContent = `@import "./variables.css";
@import "./utils.css";\n`;
    await fs.outputFile(indexPath, indexCssContent);

    const relativeImportPath = path.relative(
        path.dirname(globalCssPath),
        indexPath
    );

    let globalCssContent = "";
    if (await fs.pathExists(globalCssPath)) {
        globalCssContent = await fs.readFile(globalCssPath, "utf-8");
    }
    const importStatement = `@import "${relativeImportPath.replace(/\\/g, "/")}";`;
    if (!globalCssContent.includes(importStatement)) {
        globalCssContent = `${importStatement}\n${globalCssContent}`;
        await fs.outputFile(globalCssPath, globalCssContent);
    }

    console.log("✅ Dora Styles initialized at:", configPath);
    console.log(`🔗 Linked index.css into ${answers.globalCss}`);

    const configFilePath = path.join(projectRoot, "dora-styles.json");
    await fs.writeJson(
        configFilePath,
        {
            configPath: answers.configPath,
            globalCss: answers.globalCss,
        },
        { spaces: 2 }
    );

    console.log(`✅ Created dora-styles.json at ${configFilePath}`);
}
