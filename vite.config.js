import { defineConfig } from "vite";

export default defineConfig({
    base: './',
    build: {
        outDir: './docs/',
        sourcemap: false,
        rollupOptions: {
            cache: false,
            maxParallelFileOps: 2,
            output: {
                sourcemap: false
            },
            manualChunks: (id) => {
                if(id.includes('grams')) return 'grams';
            }
        }
    }
});
