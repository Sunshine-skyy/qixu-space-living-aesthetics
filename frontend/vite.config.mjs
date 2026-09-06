import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const pages = [
    'index', 'account', 'community', 'consultation', 'design-tool',
    'feedback', 'recommendations', 'shopping'
];

export default defineConfig({
    build: {
        rollupOptions: {
            input: Object.fromEntries(pages.map(page => [page, resolve(process.cwd(), `${page}.html`)]))
        }
    }
});
