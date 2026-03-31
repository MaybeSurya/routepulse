/**
 * Haversine formula to calculate the distance between two points in meters.
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const EARTH_RADIUS_METERS = 6_371_000;
  
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

/**
 * Simple ETA calculation based on distance and average speed.
 * Returns estimated minutes.
 */
export function calculateETA(
  currentLat: number,
  currentLng: number,
  targetLat: number,
  targetLng: number,
  averageSpeedKph: number = 25,
): number {
  const distanceMeters = haversineDistance(currentLat, currentLng, targetLat, targetLng);
  if (distanceMeters < 50) return 0; // Already there

  // Speed in m/s
  const speedMs = (averageSpeedKph * 1000) / 3600;
  const seconds = distanceMeters / speedMs;

  return Math.ceil(seconds / 60); // Return minutes
}
