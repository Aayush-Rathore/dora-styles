#!/usr/bin/env node
import fs from "fs";
import path from "path";

const configFile = path.join(process.cwd(), "dora-styles.json");
if (!fs.existsSync(configFile)) {
    console.error("❌ dora-styles.json not found in project root. Run `dora-styles init` first.");
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
const configPath = path.resolve(process.cwd(), config.configPath);

const variablesFile = path.join(configPath, "variables.css");
const compiledFile = path.join(configPath, "compiled.css");

if (!fs.existsSync(variablesFile)) {
    console.error(`❌ variables.css not found in ${configPath}`);
    process.exit(1);
}

const css = fs.readFileSync(variablesFile, "utf-8");

function extractVars(block) {
    const varRegex = /--([a-zA-Z0-9-_]+):\s*([^;]+);/g;
    const vars = {};
    let match;
    while ((match = varRegex.exec(block)) !== null) {
        vars[match[1]] = match[2].trim();
    }
    return vars;
}

const rootMatch = css.match(/:root\s*{([^}]+)}/s);
const darkMatch = css.match(/\.dark\s*{([^}]+)}/s);

const rootVars = rootMatch ? extractVars(rootMatch[1]) : {};
const darkVars = darkMatch ? extractVars(darkMatch[1]) : {};

// Shades to generate
const scales = [10, 20, 30, 40, 50, 60, 70, 80, 90];

// Generate shades for a given variable set
function generateShades(vars, selector) {
    let out = `${selector} {\n`;
    for (const [name, value] of Object.entries(vars)) {
        if (/^(rgb|hsl|#)/.test(value)) {
            for (const scale of scales) {
                out += `  --${name}-${scale}: color-mix(in srgb, var(--${name}) ${scale}%, transparent);\n`;
            }
        }
    }
    out += "}\n\n";
    return out;
}

// Build output
let output = "/* Dora Styles Compiled Variables */\n\n";
if (Object.keys(rootVars).length > 0) {
    output += generateShades(rootVars, ":root");
}
if (Object.keys(darkVars).length > 0) {
    output += generateShades(darkVars, ".dark");
}

// Write compiled.css
fs.writeFileSync(compiledFile, output, "utf-8");
console.log(`✅ Dora Styles compiled → ${compiledFile}`);