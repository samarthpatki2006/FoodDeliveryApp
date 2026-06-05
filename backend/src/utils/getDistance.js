const calculateDistance = (
  sourceLatitude,
  sourceLongitude,
  destLatitude,
  destLongitude
) => {
  const EARTH_RADIUS = 6371; // km

  // Convert to radians
  const lat1 = (sourceLatitude * Math.PI) / 180;
  const lon1 = (sourceLongitude * Math.PI) / 180;
  const lat2 = (destLatitude * Math.PI) / 180;
  const lon2 = (destLongitude * Math.PI) / 180;

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.asin(Math.sqrt(a));

  return EARTH_RADIUS * c;
};

export default calculateDistance;