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
            output: {
                sourcemap: false,
                manualChunks: (id) => {
                    if(id.includes('grams')) return 'grams';
                }
            },
        }
    }
});
