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
    plugins: [{
        name: 'copy-static-assets',
        closeBundle() {
            for (const directory of ['img', 'Acolher-IA', 'comunidade', 'configurações', 'login', 'blog', 'Direitos', 'Explorar', 'ferramentas', 'Recursos', 'trilhas', 'apoiar', 'biblioteca', 'loja']) {
                const source = path.join(process.cwd(), directory);
                const destination = path.join(process.cwd(), 'dist', directory);
                if (fs.existsSync(source)) fs.cpSync(source, destination, { recursive: true, force: true });
            }
        }
    }],
    build: {
        rollupOptions: {
            input: collectHtmlFiles(process.cwd())
        }
    }
});
