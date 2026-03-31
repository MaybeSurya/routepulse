import { BusRepository } from "../repositories/bus.repository";

const EARTH_RADIUS_METERS = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

export function calculateSpeed(distanceMeters: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  return (distanceMeters / elapsedMs) * 3_600_000 / 1_000;
}

export function calculateHeading(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export interface StopDetectionResult {
  reachedStopId: string | null;
  isFinalStop: boolean;
  distanceToNearest: number;
}

export const GpsService = {
  /**
   * Detect if the bus has reached any route stop.
   * Promotes domain intelligence to trigger events on stop approach.
   */
  async detectStopReached(
    busId: string,
    lat: number,
    lng: number,
  ): Promise<StopDetectionResult> {
    const bus = await BusRepository.findByIdWithRouteAndStops(busId);

    if (!bus?.route?.stops.length) {
      return { reachedStopId: null, isFinalStop: false, distanceToNearest: Infinity };
    }

    const stops = bus.route.stops;
    let nearestStop = stops[0]!;
    let minDist = Infinity;

    for (const stop of stops) {
      const dist = haversineDistance(lat, lng, stop.lat, stop.lng);
      if (dist < minDist) {
        minDist = dist;
        nearestStop = stop;
      }
    }

    const threshold = nearestStop.radiusMeters;
    const reached = minDist <= threshold;
    const isFinalStop = reached && nearestStop.order === stops[stops.length - 1]!.order;

  return {
      reachedStopId: reached ? nearestStop.id : null,
      isFinalStop,
      distanceToNearest: minDist,
    };
  },

  /**
   * Determine if the new location is significant enough to log to the historical record.
   * Throttles at 5 seconds OR 10 meters.
   */
  shouldLogHistory(
    lastLat: number | null,
    lastLng: number | null,
    lastTime: number | null,
    currentLat: number,
    currentLng: number,
  ): boolean {
    if (!lastLat || !lastLng || !lastTime) return true;

    const timeDiffMs = Date.now() - lastTime;
    if (timeDiffMs >= 5000) return true; // Log at least every 5 seconds

    const dist = haversineDistance(lastLat, lastLng, currentLat, currentLng);
    if (dist >= 10) return true; // Log if moved more than 10 meters

    return false;
  },

  /**
   * Simple ETA calculation based on distance and average speed.
   */
  calculateETA(
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
};
