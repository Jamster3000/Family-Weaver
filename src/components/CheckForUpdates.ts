import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export async function checkForAppUpdates() {
    try {
        const update = await check();

        if (update) {
            console.log(`Found update ${update.version} from ${update.date}`);

            await update.downloadAndInstall();

            await relaunch();
        }
    } catch (error) {
        console.error('Failed to check for updates:', error);
    }
}