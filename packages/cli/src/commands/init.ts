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
    const answers = await inquirer.prompt<{ globalCss: string; configPath: string }>([
        {
            type: "input",
            name: "globalCss",
            message: "Where is your global.css located?",
            default: "src/styles/global.css",
        },
        {
            type: "input",
            name: "configPath",
            message: "Where do you want to keep dora-styles config?",
            default: "src/styles/dora-styles",
        },
    ]);

    const configPath = path.resolve(process.cwd(), answers.configPath);
    await fs.ensureDir(configPath);

    await fetchFile(
        "https://raw.githubusercontent.com/Aayush-Rathore/dora-styles/main/packages/styles/variables.css",
        path.join(configPath, "variables.css")
    );

    await fetchFile(
        "https://raw.githubusercontent.com/Aayush-Rathore/dora-styles/main/packages/scripts/compile.js",
        path.join(configPath, "compile.js")
    );

    console.log("✅ Dora Styles initialized at:", configPath);
    console.log("🚧 Link your global.css to your index file if needed");
}
