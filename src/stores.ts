import { writable, get } from 'svelte/store';

export const networkStore = writable(null);

export function zoomIn() {
    const network = get(networkStore);
    if (network) {
        const currentScale = network.getScale();
        network.setOptions({
            interaction: { navigationButtons: true, keyboard: true }
        });
        // adjust the canvas to zoom
        const currentPos = network.getViewPosition();
        network.moveTo({
            position: currentPos,
            scale: currentScale * 1.5,
            animation: { duration: 400 }
        });
    }
}

export function zoomOut() {
    const network = get(networkStore);
    if (network) {
        const currentScale = network.getScale();
        const currentPos = network.getViewPosition();
        network.moveTo({
            position: currentPos,
            scale: currentScale / 1.5,
            animation: { duration: 400 }
        });
    }
}