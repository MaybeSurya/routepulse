import { RouteRepository } from "../repositories/route.repository";
import { TRPCError } from "@trpc/server";

export const RouteService = {
  async listRoutes(activeOnly: boolean = true) {
    return RouteRepository.list(activeOnly);
  },

  async getRoute(id: string) {
    const route = await RouteRepository.findById(id);
    if (!route) throw new TRPCError({ code: "NOT_FOUND", message: "Route not found" });
    return route;
  },

  async createRoute(data: any) {
    return RouteRepository.create(data);
  },

  async updateRoute(id: string, data: any) {
    return RouteRepository.update(id, data);
  },

  async addStop(routeId: string, data: any) {
    return RouteRepository.addStop(routeId, data);
  },

  async removeStop(stopId: string) {
    await RouteRepository.removeStop(stopId);
    return { success: true };
  },

  async deleteRoute(id: string) {
    await RouteRepository.delete(id);
    return { success: true };
  }
};
