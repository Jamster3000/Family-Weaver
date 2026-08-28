import { writable } from 'svelte/store';

export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}

function createToastStore() {
    const { subscribe, update } = writable<ToastMessage[]>([]);

    const add = (message: string, type: 'success' | 'error' | 'info' = 'info', duration?: number) => {
        const id = Math.random().toString(36).slice(2, 11);
        const toast: ToastMessage = { id, message, type, duration };

        update(toasts => [...toasts, toast]);

        return id;
    };

    const remove = (id: string) => {
        update(toasts => toasts.filter(t => t.id !== id));
    };

    return {
        subscribe,
        add,
        remove,
        success: (message: string, duration?: number) => add(message, 'success', duration),
        error: (message: string, duration?: number) => add(message, 'error', duration),
        info: (message: string, duration?: number) => add(message, 'info', duration),
    };
}

export const toasts = createToastStore();