import fs from "fs-extra";
import path from "path";
import { fetchFile } from "../utils/fetchFile";

export async function add(component: string) {
    const projectRoot = process.cwd();
    const configFilePath = path.join(projectRoot, "dora-styles.json");

    if (!(await fs.pathExists(configFilePath))) {
        console.error("❌ No dora-styles.json found. Run `dora-styles init` first.");
        process.exit(1);
    }

    const config = await fs.readJson(configFilePath);
    const configPath = path.resolve(projectRoot, config.configPath);
    const indexPath = path.join(configPath, "index.css");

    const componentPath = path.join(configPath, `${component}.css`);

    const RAW_BASE =
        "https://raw.githubusercontent.com/Aayush-Rathore/dora-styles/dora-styles";
    const remoteUrl = `${RAW_BASE}/packages/styles/components/${component}.css`;

    try {
        await fetchFile(remoteUrl, componentPath);
        console.log(`✅ Added component: ${component}.css`);
    } catch (err: any) {
        console.error(`❌ Failed to fetch component "${component}":`, err.message);
        return;
    }

    let indexContent = "";
    if (await fs.pathExists(indexPath)) {
        indexContent = await fs.readFile(indexPath, "utf-8");
    }

    const importLine = `@import "./${component}.css";`;
    if (!indexContent.includes(importLine)) {
        indexContent += `\n${importLine}\n`;
        await fs.writeFile(indexPath, indexContent);
        console.log(`🔗 Linked ${component}.css in index.css`);
    }
}
