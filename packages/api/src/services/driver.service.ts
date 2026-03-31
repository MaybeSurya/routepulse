import { DriverRepository } from "../repositories/driver.repository";
import { BusRepository } from "../repositories/bus.repository";
import { GpsService } from "./gps.service";
import { TRPCError } from "@trpc/server";
import { broadcastLocation, broadcastSOS } from "../lib/realtime";
import { redis } from "./seats.service";

export const DriverService = {
  async getAssignedBus(driverUserId: string) {
    const driver = await DriverRepository.getAssignedBusesByUserId(driverUserId);

    if (!driver) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Driver profile not found" });
    }

    // Usually a driver is active on one bus at a time
    const activeBus = driver.buses.find((b) => b.status === "en_route" || b.status === "maintenance") || driver.buses[0];

    return { driver, bus: activeBus || null };
  },

  async processLocationUpdate(driverUserId: string, data: { busId: string, lat: number, lng: number, speed: number, heading?: number }) {
    // Basic authorization checking
    const driver = await DriverRepository.getAssignedBusesByUserId(driverUserId);
    if (!driver || !driver.buses.some(b => b.id === data.busId)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Bus is not assigned to you" });
    }

    // Check throttling via Redis
    const cacheKey = `bus:last_gps:${data.busId}`;
    const lastGpsStr = await redis.get<string>(cacheKey);
    const lastGps = lastGpsStr ? JSON.parse(lastGpsStr) : null;

    const shouldLog = GpsService.shouldLogHistory(
      lastGps?.lat ?? null,
      lastGps?.lng ?? null,
      lastGps?.ts ?? null,
      data.lat,
      data.lng
    );

    let detection = null;

    if (shouldLog) {
      // Persist location history
      await BusRepository.addLocation({
        busId: data.busId,
        lat: data.lat,
        lng: data.lng,
        speed: data.speed,
        heading: data.heading,
      });

      // Update current location on the Bus record for fast lookups
      await BusRepository.update(data.busId, {
        lat: data.lat,
        lng: data.lng,
        speed: data.speed,
        heading: data.heading,
        status: "en_route"
      });

      // Update Redis cache
      await redis.set(cacheKey, JSON.stringify({
        lat: data.lat,
        lng: data.lng,
        ts: Date.now()
      }), { ex: 60 }); // Cache for 1 min

      // Run business logic for stop detection ONLY when moving significantly
      detection = await GpsService.detectStopReached(data.busId, data.lat, data.lng);
    }

    // ALWAYS broadcast via Supabase for smooth UI
    await broadcastLocation(data.busId, {
      lat: data.lat,
      lng: data.lng,
      speed: data.speed,
      heading: data.heading,
      timestamp: new Date().toISOString()
    });

    return { success: true, logged: shouldLog, detection };
  },

  async markStopReached(driverUserId: string, busId: string, stopId: string) {
    const driver = await DriverRepository.getAssignedBusesByUserId(driverUserId);
    if (!driver || !driver.buses.some(b => b.id === busId)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Bus is not assigned to you" });
    }

    const bus = await BusRepository.findByIdWithRouteAndStops(busId);
    if (!bus || !bus.route) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bus or Route not found" });
    }

    const currentStopIndex = bus.route.stops.findIndex(s => s.id === stopId);
    const stop = bus.route.stops[currentStopIndex];
    const nextStop = bus.route.stops[currentStopIndex + 1] || null;

    // Automatic stop refinement logic
    if (stop && bus.lat && bus.lng) {
      const distance = Math.sqrt(
        Math.pow(stop.lat - bus.lat, 2) + Math.pow(stop.lng - bus.lng, 2)
      ) * 111320; // Approx distance in meters

      // Only refine if the driver is within 300m of the currently mapped stop
      if (distance < 300) {
        const count = (stop as any).detectionCount || 0;
        const weight = 1 / (count + 1);
        const newLat = stop.lat * (count / (count + 1)) + bus.lat * weight;
        const newLng = stop.lng * (count / (count + 1)) + bus.lng * weight;

        await BusRepository.updateStop(stopId, {
          lat: newLat,
          lng: newLng,
          detectionCount: count + 1
        });
      }
    }

    await BusRepository.update(busId, {
        lastStopId: stopId,
        nextStopId: nextStop?.id || null,
        status: nextStop ? "en_route" : "arrived"
    });

    return { success: true, lastStopId: stopId, nextStopId: nextStop?.id };
  },

  async triggerSOS(driverUserId: string, busId: string, lat: number, lng: number, speed: number, message?: string) {
    const driver = await DriverRepository.getAssignedBusesByUserId(driverUserId);
    if (!driver || !driver.buses.some(b => b.id === busId)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Bus is not assigned to you" });
    }

    const payload = {
      busId,
      userId: driverUserId,
      userName: driver.user.email, // Use email as fallback for name
      lat,
      lng,
      speed,
      timestamp: new Date().toISOString(),
      message: message || "CRITICAL: Manual SOS Triggered"
    };

    await broadcastSOS(payload);

    const { LogService } = await import("./log.service");
    await LogService.critical("SOS_TRIGGERED", payload.message, { lat, lng, speed }, driverUserId, busId);

    return { success: true };
  }
};
