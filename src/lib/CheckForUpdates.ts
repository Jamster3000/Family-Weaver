import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { updateStore } from '$updateStore';
import { toasts } from '$toastStore';

export async function checkForAppUpdates(): Promise<Update | null> {
    try {
        const update = await check();
        if (update) {
            return update;
        } else {
            // Clear the pendingUpdate flag if no update is found
            updateStore.clearUpdate();
        }
    } catch (error) {
        console.error('Failed to check for updates:', error);
    }
    return null;
}

export async function checkForAppUpdatesBackground(): Promise<Update | null> {
    try {
        const update = await check();
        if (update) {
            updateStore.setUpdateAvailable(update.version);
            toasts.info(`Family Weaver ${update.version} is available. Check the app menu to update.`);
            return update;
        }
    } catch (error) {
        console.error('Failed to check for updates in background:', error);
    }
    return null;
}

export async function installUpdate(update: Update): Promise<void> {
    await update.downloadAndInstall();
    await relaunch();
}