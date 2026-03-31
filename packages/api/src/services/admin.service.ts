import { AdminRepository } from "../repositories/admin.repository";
import { TRPCError } from "@trpc/server";
import { hashPassword } from "../lib/jwt";
import { broadcastAnnouncement } from "../lib/realtime";
import { RoutingService } from "./routing.service";

export const AdminService = {
  async getSystemAnalytics() {
    return AdminRepository.getSystemAnalytics();
  },

  async listBuses(status?: string, routeId?: string) {
    return AdminRepository.listBuses(status, routeId);
  },

  async listRoutes() {
    return AdminRepository.listRoutes();
  },

  async updateRoute(id: string, data: any) {
    if (data.stops && data.stops.length >= 2) {
      try {
        const routeGeo = await RoutingService.calculateRoute(data.stops);
        data.polyline = JSON.stringify(routeGeo.coordinates);
      } catch (error) {
        console.warn("Routing calculation failed during update, proceeding without polyline:", error);
      }
    }
    return AdminRepository.updateRoute(id, data);
  },

  async deleteRoute(id: string) {
    return AdminRepository.deleteRoute(id);
  },

  async createRoute(data: any) {
    const existing = await AdminRepository.findRouteByName(data.name);
    if (existing) {
      throw new TRPCError({ code: "CONFLICT", message: "Route with this name already exists" });
    }

    if (data.stops && data.stops.length >= 2) {
      try {
        const routeGeo = await RoutingService.calculateRoute(data.stops);
        data.polyline = JSON.stringify(routeGeo.coordinates);
      } catch (error) {
        console.warn("Routing calculation failed during creation, proceeding without polyline:", error);
      }
    }

    return AdminRepository.createRoute(data);
  },

  async listAllUsers() {
    return AdminRepository.listAllUsers();
  },

  async updateUserRole(id: string, role: any) {
    const user = await AdminRepository.getUserById(id);
    if (user?.role === "super_admin" && role !== "super_admin") {
       throw new TRPCError({ code: "FORBIDDEN", message: "Cannot demote a super admin" });
    }
    return AdminRepository.updateUserRole(id, role);
  },

  async deleteUser(id: string) {
    const user = await AdminRepository.getUserById(id);
    if (user?.role === "super_admin") {
       throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete a super admin" });
    }
    return AdminRepository.deleteUser(id);
  },

  async listStudents(search?: string, limit: number = 50, offset: number = 0) {
    return AdminRepository.listStudents(search, limit, offset);
  },

  async listDrivers() {
    return AdminRepository.listDrivers();
  },

  async createDriver(input: any) {
    const existing = await AdminRepository.findDriverByDriverId(input.driverId);
    if (existing) {
      throw new TRPCError({ code: "CONFLICT", message: "Driver ID already in use" });
    }

    const passwordHash = await hashPassword(input.pin);
    return AdminRepository.createDriver({
      ...input,
      passwordHash,
    });
  },

  async createBus(data: any) {
    const existing = await AdminRepository.findBusByPlateNumber(data.plateNumber);
    if (existing) {
      throw new TRPCError({ code: "CONFLICT", message: "Bus with this plate number already registered" });
    }

    // Enforce one driver per bus
    if (data.driverId) {
      const driverAlreadyAssigned = await AdminRepository.findBusByDriverId(data.driverId);
      if (driverAlreadyAssigned) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `This driver is already assigned to unit ${driverAlreadyAssigned.plateNumber}. A driver can only operate one bus at a time.`
        });
      }
    }

    return AdminRepository.createBus(data);
  },

  async deleteBus(id: string) {
    return AdminRepository.deleteBus(id);
  },

  async listComplaints(status?: string) {
    return AdminRepository.listComplaints(status);
  },

  async updateComplaint(id: string, data: any) {
    return AdminRepository.updateComplaint(id, data);
  },

  async createAnnouncement(data: any, authorId: string) {
    const announcement = await AdminRepository.createAnnouncement(data, authorId);
    await broadcastAnnouncement(announcement);
    return announcement;
  },

  async routeUsage() {
    const routes = await AdminRepository.routeUsage();
    return routes.map((r) => ({
      routeId: r.id,
      name: r.name,
      totalBookings: r._count.bookings,
      activeBuses: r._count.buses,
      isActive: r.isActive,
    }));
  },

  async dispatchBus(busId: string, routeId: string, driverId?: string) {
    const bus = await AdminRepository.getBusById(busId);
    if (!bus) throw new TRPCError({ code: "NOT_FOUND", message: "Unit not found" });

    const route = await AdminRepository.getRouteById(routeId);
    if (!route) throw new TRPCError({ code: "NOT_FOUND", message: "Strategic route not found" });

    // Enforce one driver per bus during dispatch
    const effectiveDriverId = driverId || bus.driverId;
    if (effectiveDriverId) {
      const driverAlreadyAssigned = await AdminRepository.findBusByDriverId(effectiveDriverId);
      if (driverAlreadyAssigned && driverAlreadyAssigned.id !== busId) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `This driver is already deployed on unit ${driverAlreadyAssigned.plateNumber}. Reassign before dispatching.`
        });
      }
    }

    return AdminRepository.updateBus(busId, {
      routeId,
      driverId: effectiveDriverId,
      status: "en_route",
    });
  }
};
