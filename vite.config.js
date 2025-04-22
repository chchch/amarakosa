import { resolve } from 'node:path';
import { defineConfig } from "vite";

export default defineConfig({
    base: './',
    build: {
        outDir: './docs/',
        emptyOutDir: false,
        sourcemap: false,
        rollupOptions: {
            cache: false,
            maxParallelFileOps: 1,
            input: {
                main: resolve(__dirname, 'index.html'),
                counts: resolve(__dirname, 'counts.html')
            },
            output: {
                sourcemap: false,
                manualChunks: (id) => {
                    if(id.includes('grams')) return 'grams';
                }
            },
        }
    },
    assetsInclude: ['**/*.db']
});
