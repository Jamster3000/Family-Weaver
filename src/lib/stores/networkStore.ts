import { writable, get } from 'svelte/store';
import type { Network } from 'vis-network/standalone';

export const networkStore = writable<Network | null>(null);

export function zoomIn() {
    const network = get(networkStore);
    if (network) {
        const currentScale = network.getScale();
        const currentPos = network.getViewPosition();
        network.moveTo({
            position: currentPos,
            scale: currentScale * 1.5,
            animation: {
                duration: 400,
                easingFunction: 'easeInOutQuad'
            }
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
            animation: {
                duration: 400,
                easingFunction: 'easeInOutQuad'
            }
        });
    }
}