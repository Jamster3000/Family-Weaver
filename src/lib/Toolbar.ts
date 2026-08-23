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
}

export const getLeftItems = (hasUpdate: boolean = false): ToolbarItem[] => [
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
        id: "app",
        label: "App",
        tooltip: "App settings and options.",
        icon: IconSettings,
        submenu: [
            {
                id: "settings",
                label: "Settings",
                tooltip: "Open app settings to change preferenced",
                icon: IconSettings,
                action: () => console.log("Open settings modal"),
            },
            ...(hasUpdate ? [{
                id: "update-now",
                label: "Update Available",
                tooltip: "Install the latest version of Family Weaver.",
                icon: IconDownload,
                action: () => models.open("appUpdate"),
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