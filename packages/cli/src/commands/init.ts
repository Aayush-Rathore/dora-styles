import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";

async function fetchFile(url: string, dest: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const text = await res.text();
    await fs.outputFile(dest, text);
}

export async function init() {
    const answers = await inquirer.prompt<{ configPath: string; }>([
        {
            type: "input",
            name: "configPath",
            message: "Where do you want to keep dora-styles stuff?",
            default: "src/dora-styles",
        },
    ]);

    const configPath = path.resolve(process.cwd(), answers.configPath);
    const globalCssPath = path.resolve(process.cwd(), answers.configPath);
    await fs.ensureDir(configPath);

    const RAW_BASE = "https://raw.githubusercontent.com/Aayush-Rathore/dora-styles/dora-styles";

    await fetchFile(
        `${RAW_BASE}/packages/styles/variables.css`,
        path.join(globalCssPath, "variables.css")
    );

    await fetchFile(
        `${RAW_BASE}/packages/styles/utils.css`,
        path.join(configPath, "utils.css")
    );

    console.log("✅ Dora Styles initialized at:", configPath);
    console.log("🚧 Link your global.css to your index file if needed");

    const projectRoot = process.cwd();
    const configFilePath = path.join(projectRoot, "dora-styles.json");
    await fs.writeJson(configFilePath, answers, { spaces: 2 });

    console.log(`✅ Created dora-styles.json at ${configFilePath}`);
}
