export interface BranchData {
	id: number;
	d: string;
	strokeWidth: number;
	length: number;
	startTime: number;
}

export interface LeafData {
	id: number;
	cx: number;
	cy: number;
	r: number;
	delay: number;
}

export interface TreeConfig {
	leafUrl: string;
	barkUrl: string;
	isSakura: boolean;
	isAutumn: boolean;
	isWinter: boolean;
}