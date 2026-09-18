function isSouthernHemisphere(): boolean {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const southernPrefixes = [
        'Antarctica/', 'America/Argentina/', 'America/Buenos_Aires/',
        'America/Santiago/', 'America/Sao_Paulo/', 'America/Montevideo/',
        'America/Lima/', 'America/La_Paz/', 'Africa/Johannesburg/',
        'Australia/', 'Pacific/Auckland/', 'Indian/Mauritius'
    ];
    return southernPrefixes.some((prefix) => timeZone.startsWith(prefix));
}

function getEquinoxDates(year: number) {
    const m = (year - 2000) / 1000;

    const marchDay = 20.6427 + 365.24219 * (year - 2000) - Math.floor((year - 2000) / 4);
    const septDay = 23.1374 + 365.24219 * (year - 2000) - Math.floor((year - 2000) / 4);

    return {
        marchEquinox: new Date(Date.UTC(year, 2, Math.floor(marchDay))),
        septemberEquinox: new Date(Date.UTC(year, 8, Math.floor(septDay)))
    };
}

export function getAstronomicalSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
    const now = new Date();
    const year = now.getFullYear();
    const isSouth = isSouthernHemisphere();

    const marchEquinox = new Date(year, 2, 20); // March 20
    const juneSolstice = new Date(year, 5, 21); // June 21
    const septemberEquinox = new Date(year, 8, 22); // September 22
    const decemberSolstice = new Date(year, 11, 21); // December 21

    let northSeason: 'spring' | 'summer' | 'autumn' | 'winter';

    if (now >= marchEquinox && now < juneSolstice) {
        northSeason = 'spring';
    } else if (now >= juneSolstice && now < septemberEquinox) {
        northSeason = 'summer';
    } else if (now >= septemberEquinox && now < decemberSolstice) {
        northSeason = 'autumn';
    } else {
        northSeason = 'winter';
    }

    if (!isSouth) return northSeason;

    const southernOpposites = {
        spring: 'autumn',
        summer: 'winter',
        autumn: 'spring',
        winter: 'summer'
    } as const;

    return southernOpposites[northSeason];
}