import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { updateStore } from '$updateStore';
import { modals } from '$modalStore';
import { toasts } from '$toastStore';
import { createLogger } from '$lib/logger';

const logger = createLogger('CheckForUpdates.ts');

export async function checkForAppUpdates(): Promise<Update | null> {
    logger.info('Checking for app updates...');
    try {
        const update = await check();
        if (update) {
            logger.info(`Update available: ${update.version}`);
            updateStore.setUpdateAvailable(update.version);
            modals.open('appUpdate');
            return update;
        } else {
            updateStore.clearUpdate();
        }
    } catch (error) {
        console.error('Failed to check for updates:', error);
        logger.error(`Error checking for updates: ${error}`);
    }
    return null;
}

export async function checkForAppUpdatesBackground(): Promise<Update | null> {
    logger.info('Checking for app updates in background...');
    try {
        const update = await check();
        if (update) {
            updateStore.setUpdateAvailable(update.version);
            modals.open('appUpdate');

            if (window.location.pathname === '/tree') {
                toasts.info(`Family Weaver ${update.version} is available. Check the app menu to update.`);
            }

            logger.info(`Update available in background: ${update.version}`);
            return update;
        }
    } catch (error) {
        console.error('Failed to check for updates in background:', error);
        logger.error(`Error checking for updates in background: ${error}`);
    }
    return null;
}

export async function installUpdate(update: Update): Promise<void> {
    logger.info(`Installing update: ${update.version}`);
    await update.downloadAndInstall();
    await relaunch();
}