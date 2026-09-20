import { writable } from 'svelte/store';

export type ModalType =
	| 'addPerson'
	| 'createTree'
	| 'renameTree'
	| 'switchTree'
	| 'deleteTreeConfirm'
	| 'deletePersonConfirm'
	| 'discardPersonChanges'
	| 'whatsNew'
	| 'appUpdate'
	| 'timelineEntry'
	| 'settings'
	| 'deleteAllData'
	| 'logs'
	| 'confirmSavePerson';

type ModalState = Record<ModalType, boolean>;

const initialState: ModalState = {
	addPerson: false,
	createTree: false,
	renameTree: false,
	switchTree: false,
	deleteTreeConfirm: false,
	deletePersonConfirm: false,
	discardPersonChanges: false,
	whatsNew: false,
	appUpdate: false,
	timelineEntry: false,
	settings: false,
	deleteAllData: false,
	logs: false,
	confirmSavePerson: false,
};

function createModalStore() {
	const { subscribe, update, set } = writable<ModalState>(initialState);
	let modalData: Partial<Record<ModalType, Record<string, any>>> = {};

	return {
		subscribe,
		open: (modal: ModalType, data?: Record<string, any>) => {
			if (data) modalData[modal] = data;
			update((s) => ({ ...s, [modal]: true }));
		},
		close: (modal: ModalType) => update((s) => ({ ...s, [modal]: false })),
		toggle: (modal: ModalType) => update((s) => ({ ...s, [modal]: !s[modal] })),
		closeAll: () => set(initialState),
		getData: (modal: ModalType) => modalData[modal],
	};
}

export const modals = createModalStore();