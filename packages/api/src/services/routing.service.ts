import { TRPCError } from "@trpc/server";

const GRAPHHOPPER_API_KEY = process.env.GRAPHHOPPER_KEY || "b4f7fa3e-54bd-4667-a3f5-db40e398145b";
const MAX_POINTS_PER_REQUEST = 5; // GraphHopper Free Tier limit

export interface RouteGeometry {
  coordinates: [number, number][]; // [longitude, latitude]
  distance: number;
  time: number;
}

export const RoutingService = {
  /**
   * Calculates a complete route geometry using GraphHopper Routing API.
   * Handles the 5-point limit of the free tier by segmenting the request.
   */
  async calculateRoute(stops: { lat: number; lng: number }[]): Promise<RouteGeometry> {
    if (stops.length < 2) {
      throw new TRPCError({ 
        code: "BAD_REQUEST", 
        message: "At least two stops are required to calculate a route" 
      });
    }

    try {
      let fullCoordinates: [number, number][] = [];
      let totalDistance = 0;
      let totalTime = 0;

      // Segmented routing: Calculate in chunks of 5 points, overlapping the last point of each chunk
      for (let i = 0; i < stops.length - 1; i += (MAX_POINTS_PER_REQUEST - 1)) {
        const chunk = stops.slice(i, i + MAX_POINTS_PER_REQUEST);
        if (chunk.length < 2) break;

        const segment = await fetchSegment(chunk);
        
        // Avoid duplicating the junction nodes
        const coordsToAdd = i === 0 ? segment.coordinates : segment.coordinates.slice(1);
        fullCoordinates = [...fullCoordinates, ...coordsToAdd];
        totalDistance += segment.distance;
        totalTime += segment.time;
      }

      return {
        coordinates: fullCoordinates,
        distance: totalDistance,
        time: totalTime,
      };
    } catch (error: any) {
      console.error("GraphHopper Routing Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Routing failed: ${error.message || "Unknown error"}`,
      });
    }
  },
};

async function fetchSegment(points: { lat: number; lng: number }[]): Promise<RouteGeometry> {
  const baseUrl = "https://graphhopper.com/api/1/route";
  const params = new URLSearchParams({
    key: GRAPHHOPPER_API_KEY,
    profile: "car",
    points_encoded: "false",
    locale: "en",
  });

  points.forEach(p => {
    params.append("point", `${p.lat},${p.lng}`);
  });

  const response = await fetch(`${baseUrl}?${params.toString()}`);
  const data = (await response.json()) as any;

  if (!response.ok) {
    throw new Error(data.message || `GraphHopper API returned ${response.status}`);
  }

  const path = data.paths[0];
  return {
    coordinates: path.points.coordinates, // GraphHopper returns [lng, lat] when points_encoded=false
    distance: path.distance,
    time: path.time,
  };
}
