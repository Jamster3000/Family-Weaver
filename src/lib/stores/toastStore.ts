import { writable } from 'svelte/store';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<ToastMessage[]>([]);

  const add = (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
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
    success: (message: string, duration?: number) => add(message, 'success', duration ?? 4000),
    error: (message: string, duration?: number) => add(message, 'error', duration ?? 4000),
    info: (message: string, duration?: number) => add(message, 'info', duration ?? 4000),
  };
}

export const toasts = createToastStore();