import path from 'path';
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter({
            fallback: "index.html",
        }),
        alias: {
            $components: "src/components",
            $stores: path.resolve('./src/stores.ts'),
            $networkStore: path.resolve('./src/networkStore.ts'),
            $personStore: path.resolve('./src/personStore.ts'),
            $treeStore: path.resolve('./src/treeStore.ts'),
        },
    },
};

export default config;