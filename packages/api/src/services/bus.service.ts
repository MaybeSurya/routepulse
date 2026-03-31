import { BusRepository } from "../repositories/bus.repository";
import { DriverRepository } from "../repositories/driver.repository";
import { TRPCError } from "@trpc/server";

export const BusService = {
  async listBuses(status?: string, routeId?: string) {
    return BusRepository.list(status, routeId);
  },

  async getBus(id: string) {
    const bus = await BusRepository.findById(id);
    if (!bus) throw new TRPCError({ code: "NOT_FOUND", message: "Bus not found" });
    return bus;
  },

  async createBus(data: any) {
    const existing = await BusRepository.findByPlateNumber(data.plateNumber);
    if (existing) throw new TRPCError({ code: "CONFLICT", message: "Bus with this plate already exists" });

    const capacity = data.capacity || 40;
    return BusRepository.createWithSeats({
      plateNumber: data.plateNumber,
      capacity,
      model: data.model,
      routeId: data.routeId,
    }, capacity);
  },

  async updateBus(id: string, data: any) {
    return BusRepository.update(id, data);
  },

  async assignDriver(busId: string, driverId: string) {
    const driver = await DriverRepository.findByDriverIdWithAuthProfile(driverId);
    if (!driver) throw new TRPCError({ code: "NOT_FOUND", message: "Driver not found" });
    return BusRepository.assignDriver(busId, driver.id);
  },

  async updateStatus(busId: string, status: string, userSub: string, userRole: string) {
    const bus = await BusRepository.findById(busId);
    if (!bus) throw new TRPCError({ code: "NOT_FOUND", message: "Bus not found" });

    const isAdmin = ["transport_admin", "super_admin"].includes(userRole);
    const isAssignedDriver = bus.driver?.userId === userSub;
    if (!isAdmin && !isAssignedDriver) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to update bus status" });
    }

    return BusRepository.updateStatus(busId, status);
  },

  async deleteBus(id: string) {
    await BusRepository.delete(id);
    return { success: true };
  }
};
