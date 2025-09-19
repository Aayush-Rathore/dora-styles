import { Command } from "commander";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

export function link() {
    const program = new Command();

    program
        .command("link")
        .description("Link and compile dora-styles config")
        .action(async () => {
            try {
                // 1. Find dora-styles.json in root
                const configFile = path.join(process.cwd(), "dora-styles.json");
                if (!fs.existsSync(configFile)) {
                    console.error("❌ dora-styles.json not found in project root. Run `dora-styles init` first.");
                    process.exit(1);
                }

                // 2. Read configPath from dora-styles.json
                const config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
                const configPath = path.resolve(process.cwd(), config.configPath);

                const compileFile = path.join(configPath, "compile.js");
                if (!fs.existsSync(compileFile)) {
                    console.error(`❌ compile.js not found in ${configPath}`);
                    process.exit(1);
                }

                // 3. Run compile.js with Node
                console.log(`🔗 Linking and compiling Dora Styles from ${configPath}...`);

                const child = spawn("node", [compileFile], {
                    stdio: "inherit",
                });

                child.on("close", (code) => {
                    if (code === 0) {
                        console.log("✅ Dora Styles linked successfully!");
                    } else {
                        console.error(`❌ Compile script exited with code ${code}`);
                    }
                });
            } catch (err) {
                console.error("❌ Error running link command:", err);
                process.exit(1);
            }
        });

    program.parse(process.argv);
}