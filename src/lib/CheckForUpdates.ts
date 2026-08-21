import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export async function checkForAppUpdates(): Promise<Update | null> {
    try {
        const update = await check();
        if (update) {
            return update;
        }
    } catch (error) {
        console.error('Failed to check for updates:', error);
    }
    return null;
}

export async function installUpdate(update: Update): Promise<void> {
    await update.downloadAndInstall();
    await relaunch();
}