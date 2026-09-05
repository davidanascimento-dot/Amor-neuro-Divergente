import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

function collectHtmlFiles(directory, root = directory) {
    const files = [];

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            if (!['node_modules', 'dist', 'img'].includes(entry.name)) {
                files.push(...collectHtmlFiles(entryPath, root));
            }
            continue;
        }

        if (entry.isFile() && entry.name.endsWith('.html')) {
            files.push(entryPath);
        }
    }

    return files;
}

export default defineConfig({
    build: {
        rollupOptions: {
            input: collectHtmlFiles(process.cwd())
        }
    }
});
