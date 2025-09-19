import fs from "fs-extra";

export async function fetchFile(url: string, dest: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const text = await res.text();
    await fs.outputFile(dest, text);
}