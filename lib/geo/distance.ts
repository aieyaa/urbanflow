const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function haversineMeters(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number]
) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

export function nearestPointIndex(
  position: [number, number],
  geometry: [number, number][]
) {
  let nearestIndex = 0;
  let nearestDistance = Infinity;

  for (let i = 0; i < geometry.length; i++) {
    const distance = haversineMeters(position, geometry[i]);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = i;
    }
  }

  return { index: nearestIndex, distanceMeters: nearestDistance };
}

export function remainingDistanceMeters(
  fromIndex: number,
  geometry: [number, number][]
) {
  let total = 0;
  for (let i = fromIndex; i < geometry.length - 1; i++) {
    total += haversineMeters(geometry[i], geometry[i + 1]);
  }
  return total;
}
