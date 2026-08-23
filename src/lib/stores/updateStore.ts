import { writable } from 'svelte/store';

export interface UpdateState {
    hasUpdate: boolean;
    version?: string;
}

function createUpdateStore() {
    const { subscribe, set, update } = writable<UpdateState>({ hasUpdate: false });

    return {
        subscribe,
        setUpdateAvailable: (version?: string) => {
            set({ hasUpdate: true, version });
            localStorage.setItem("pendingUpdate", "true");
        },
        clearUpdate: () => {
            set({ hasUpdate: false });
            localStorage.removeItem("pendingUpdate");
        },
    };
}

export const updateStore = createUpdateStore();