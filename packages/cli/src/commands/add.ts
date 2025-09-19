import fs from "fs-extra";
import path from "path";

async function fetchFile(url: string, dest: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const text = await res.text();
    await fs.outputFile(dest, text);
}

export async function add(components: string[]) {
    const projectRoot = process.cwd();
    const configFilePath = path.join(projectRoot, "dora-styles.json");

    if (!(await fs.pathExists(configFilePath))) {
        console.error("❌ No dora-styles.json found. Run `dora-styles init` first.");
        process.exit(1);
    }

    const config = await fs.readJson(configFilePath);
    const configPath = path.resolve(projectRoot, config.configPath);
    const indexPath = path.join(configPath, "index.css");
    const componentsDir = path.join(configPath, "components");

    await fs.ensureDir(componentsDir);

    const RAW_BASE =
        "https://raw.githubusercontent.com/Aayush-Rathore/dora-styles/dora-styles/packages/styles/components";

    for (const component of components) {
        const componentPath = path.join(componentsDir, `${component}.css`);
        const remoteUrl = `${RAW_BASE}/${component}.css`;

        try {
            await fetchFile(remoteUrl, componentPath);
            console.log(`✅ Added component: ${component}.css`);
        } catch (err: any) {
            console.error(`❌ Failed to fetch component "${component}":`, err.message);
            continue;
        }

        // Update index.css
        let indexContent = "";
        if (await fs.pathExists(indexPath)) {
            indexContent = await fs.readFile(indexPath, "utf-8");
        }

        const importLine = `@import "./components/${component}.css";`;
        if (!indexContent.includes(importLine)) {
            indexContent += `\n${importLine}\n`;
            await fs.writeFile(indexPath, indexContent);
            console.log(`🔗 Linked ${component}.css in index.css`);
        }
    }
}
