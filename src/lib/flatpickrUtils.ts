import type flatpickr from "flatpickr";

export function getFlatpickrFormat(enumString: string): string {
	if (enumString.includes("14 December 2025")) return "d F Y";
	if (enumString.includes("12/14/2025")) return "m/d/Y";
	if (enumString.includes("YYYY-MM-DD")) return "Y-m-d";
	if (enumString.includes("Month DD, YYYY")) return "F j, Y";
	return "d-m-Y";
}

export function attachCustomYearSelect(instance: flatpickr.Instance): void {
	const yearWrapper = instance.currentYearElement?.parentNode as HTMLElement;
	if (!yearWrapper || !yearWrapper.classList.contains("numInputWrapper")) return;

	yearWrapper.style.display = "none";

	const select = document.createElement("select");
	select.className = "flatpickr-custom-year-select";

	select.style.background = "transparent";
	select.style.color = "var(--text-colour)";
	select.style.border = "none";
	select.style.fontFamily = "var(--font-primary)";
	select.style.fontSize = "inherit";
	select.style.fontWeight = "bold";
	select.style.cursor = "pointer";
	select.style.outline = "none";
	select.style.marginLeft = "6px";

	// Populate the year ranges (from current today's date to 100 years back)
	const currentYear = new Date().getFullYear();
	for (let i = currentYear; i >= currentYear - 1000; i--) {
		const option = document.createElement("option");
		option.value = i.toString();
		option.text = i.toString();
		option.style.background = "var(--secondary-background)";
		option.style.color = "var(--text-colour)";
		select.appendChild(option);
	}

	select.value = instance.currentYear.toString();

    // Sync selection with the flatpickr instance when the user changes the year
	select.addEventListener("change", (e) => {
		const target = e.target as HTMLSelectElement;
		instance.changeYear(parseInt(target.value, 10));
	});

	yearWrapper.parentNode?.appendChild(select);

	// Sync dropdown if year changes via month navigation
	if (!instance.config.onYearChange) {
		instance.config.onYearChange = [];
	}
	instance.config.onYearChange.push(() => {
		select.value = instance.currentYear.toString();
	});
}