import {
    IconPlus,
    IconUserPlus,
    IconTree,
    IconTrash,
    IconEdit,
    IconSettings,
    IconZoomIn,
    IconZoomOut,
    IconDownload,
    IconBug,
    IconUser
} from "@tabler/icons-svelte-runes";
import { modals } from "$modalStore";
import { zoomIn, zoomOut } from "$networkStore";

export interface ToolbarItem {
    id: string;
    label: string;
    tooltip: string;
    icon: any;
    action?: () => void;
    submenu?: ToolbarItem[];
    hidden?: boolean;
    disabled?: boolean;
    disabled_tooltip?: string;
}

export const getLeftItems = (hasUpdate: boolean = false, hasSelectedPerson: boolean = false): ToolbarItem[] => [
    {
        id: "create",
        label: "Create",
        tooltip: "Create new items like a new tree or create a new person.",
        icon: IconPlus,
        submenu: [
            {
                id: "create-person",
                label: "Add Person",
                tooltip: "Add a new person to the active family tree.",
                icon: IconUserPlus,
                action: () => modals.open("addPerson"),
            },
            {
                id: "create-tree",
                label: "New Family Tree",
                tooltip: "Create a new family tree",
                icon: IconTree,
                action: () => modals.open("createTree"),
            },
        ],
    },
    {
        id: "tree",
        label: "Tree",
        tooltip: "Open tree options.",
        icon: IconTree,
        submenu: [
            {
                id: "switch-tree",
                label: "Switch Tree",
                tooltip: "Switch to a different family tree.",
                icon: IconTree,
                action: () => modals.open("switchTree"),
            },
            {
                id: "delete-tree",
                label: "Delete Tree",
                tooltip: "Delete the current family tree.",
                icon: IconTrash,
                action: () => modals.open("deleteTreeConfirm"),
            },
            {
                id: "rename-tree",
                label: "Rename Tree",
                tooltip: "Rename the current family tree.",
                icon: IconEdit,
                action: () => modals.open("renameTree"),
            },
        ],
    },
    {
        id: "person",
        label: "Person",
        tooltip: "Open person options.",
        icon: IconUser,
        disabled: !hasSelectedPerson,
        disabled_tooltip: "Select a person to see person options.",
        submenu: [
            {
                id: "edit-person",
                label: "Edit Person",
                tooltip: "Edit the selected person's details.",
                icon: IconEdit,
                action: () => modals.open("addPerson", { mode: "edit" }),
            },
            {
                id: "view-person",
                label: "View Person",
                tooltip: "View the selected person's details.",
                icon: IconUser,
                action: () => modals.open("addPerson", { mode: "view" }),
            },
            {
                id: "delete-person",
                label: "Delete Person",
                tooltip: "Delete the selected person.",
                icon: IconTrash,
                action: () => modals.open("deletePersonConfirm"),
            }
        ],
    },
    {
        id: "app",
        label: "App",
        tooltip: "App settings and options.",
        icon: IconSettings,
        submenu: [
            {
                id: "settings",
                label: "Settings",
                tooltip: "Open app settings to change preferences",
                icon: IconSettings,
                action: () => modals.open("settings"),
            },
            {
                id: "logs",
                label: "Logs",
                tooltip: "View logs for Family Weaver ideal to give to the developer.",
                icon: IconBug,
                action: () => modals.open("logs"),
            },
            ...(hasUpdate ? [{
                id: "update-now",
                label: "Update Available",
                tooltip: "Install the latest version of Family Weaver.",
                icon: IconDownload,
                action: () => modals.open("appUpdate"),
            }]: []),
        ],
    },
];

export const rightItems: ToolbarItem[] = [
    {
        id: "zoom-in",
        label: "Zoom In",
        tooltip: "Zoom in to the family tree.",
        icon: IconZoomIn,
        action: () => zoomIn(),
    },
    {
        id: "zoom-out",
        label: "Zoom Out",
        tooltip: "Zoom out of the family tree.",
        icon: IconZoomOut,
        action: () => zoomOut(),
    },
];