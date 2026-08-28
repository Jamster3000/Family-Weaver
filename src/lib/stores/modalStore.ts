import { writable } from 'svelte/store';

export type ModalType =
	| 'addPerson'
	| 'createTree'
	| 'renameTree'
	| 'switchTree'
	| 'deleteTreeConfirm'
	| 'discardPersonChanges'
	| 'whatsNew'
	| 'appUpdate'
	| 'timelineEntry'
	| 'settings'
	| 'deleteAllData';

type ModalState = Record<ModalType, boolean>;

const initialState: ModalState = {
	addPerson: false,
	createTree: false,
	renameTree: false,
	switchTree: false,
	deleteTreeConfirm: false,
	discardPersonChanges: false,
	whatsNew: false,
	appUpdate: false,
	timelineEntry: false,
	settings: false,
	deleteAllData: false,
};

function createModalStore() {
	const { subscribe, update, set } = writable<ModalState>(initialState);

	return {
		subscribe,
		open: (modal: ModalType) => update((s) => ({ ...s, [modal]: true })),
		close: (modal: ModalType) => update((s) => ({ ...s, [modal]: false })),
		toggle: (modal: ModalType) => update((s) => ({ ...s, [modal]: !s[modal] })),
		closeAll: () => set(initialState),
	};
}

export const modals = createModalStore();