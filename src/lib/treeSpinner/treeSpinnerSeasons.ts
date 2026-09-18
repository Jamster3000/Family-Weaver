import { getAstronomicalSeason } from "$lib/treeSpinner/treeSpinnerEquinox";

export function isSakuraSeason(): boolean {
	// Sakura triggers during local early Spring (March-April in North, Sept-Oct in South)
	return getAstronomicalSeason() === 'spring';
}

export function isAutumnSeason(): boolean {
	return getAstronomicalSeason() === 'autumn';
}

export function isWinterSeason(): boolean {
	return getAstronomicalSeason() === 'winter';
}