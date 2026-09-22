export const normalizeRole = (rawRole) => {
    let role = 'passenger';
    if (rawRole) {
        const r = String(rawRole).toUpperCase();
        if (r === 'ADMIN') role = 'admin';
        else if (r === 'USER' || r === 'PASSENGER') role = 'passenger';
        else if (r === 'STATION_MASTER' || r === 'STATIONMASTER') role = 'stationMaster';
        else if (r === 'CONDUCTOR') role = 'conductor';
        else if (r === 'DRIVER') role = 'driver';
        else if (r === 'SUPPORT' || r === 'STAFF') role = 'support';
    }
    return role;
};
