export const ROLES = {
  PASSENGER: 'passenger',
  ADMIN: 'admin',
  STATION_MASTER: 'stationMaster',
  CONDUCTOR: 'conductor',
  FRONT_OFFICE: 'frontOffice',
  DRIVER: 'driver',
  SUPPORT: 'support'
};

export const normalizeRole = (r) => {
  if (!r) return ROLES.PASSENGER;
  const up = r.toUpperCase();
  if (up === 'ADMIN') return ROLES.ADMIN;
  if (up === 'STATION_MASTER' || up === 'STATIONMASTER') return ROLES.STATION_MASTER;
  if (up === 'CONDUCTOR') return ROLES.CONDUCTOR;
  if (up === 'FRONT_OFFICE' || up === 'FRONTOFFICE') return ROLES.FRONT_OFFICE;
  if (up === 'DRIVER') return ROLES.DRIVER;
  if (up === 'SUPPORT' || up === 'STAFF') return ROLES.SUPPORT;
  return ROLES.PASSENGER;
};
