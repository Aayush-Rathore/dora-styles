import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";

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

    console.log("✅ Dora Styles initialized at:", configPath);
    console.log("🚧 Link your global.css to your index file if needed");
}
