import { writable, derived } from 'svelte/store';

export type ModalType = 
  | 'addPerson' 
  | 'createTree' 
  | 'renameTree' 
  | 'switchTree' 
  | 'deleteTreeConfirm' 
  | 'discardPersonChanges'
  | 'whatsNew'
  | 'appUpdate'
  | 'timelineEntry';

interface ModalState {
  [key: string]: boolean;
}

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
};

function createModalStore() {
  const { subscribe, update, set } = writable<ModalState>(initialState);

  return {
    subscribe,
    open: (modal: ModalType) =>
      update((state) => ({
        ...state,
        [modal]: true,
      })),
    close: (modal: ModalType) =>
      update((state) => ({
        ...state,
        [modal]: false,
      })),
    toggle: (modal: ModalType) =>
      update((state) => ({
        ...state,
        [modal]: !state[modal],
      })),
    closeAll: () => set(initialState),
  };
}

export const modals = createModalStore();

export const addPersonModal = derived(modals, ($modals) => $modals.addPerson);
export const createTreeModal = derived(modals, ($modals) => $modals.createTree);
export const renameTreeModal = derived(modals, ($modals) => $modals.renameTree);
export const switchTreeModal = derived(modals, ($modals) => $modals.switchTree);
export const deleteTreeConfirmModal = derived(modals, ($modals) => $modals.deleteTreeConfirm);
export const discardPersonChangesModal = derived(modals, ($modals) => $modals.discardPersonChanges);
export const whatsNewModal = derived(modals, ($modals) => $modals.whatsNew);
export const appUpdateModal = derived(modals, ($modals) => $modals.appUpdate);
export const timelineEntryModal = derived(modals, ($modals) => $modals.timelineEntry);
