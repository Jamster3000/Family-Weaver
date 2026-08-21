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
            $lib: path.resolve('./src/lib'),
            $components: path.resolve('./src/components'),
            $networkStore: path.resolve('./src/lib/stores/networkStore.ts'),
            $personStore: path.resolve('./src/lib/stores/personStore.ts'),
            $treeStore: path.resolve('./src/lib/stores/treeStore.ts'),
            $modalStore: path.resolve('./src/lib/stores/modalStore.ts'),
        },
    },
};

export default config;