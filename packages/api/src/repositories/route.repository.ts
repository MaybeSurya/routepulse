import prisma from "@route-pulse/db";

export const RouteRepository = {
  async list(activeOnly: boolean = true) {
    return prisma.route.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        stops: { orderBy: { order: "asc" } },
        _count: { select: { buses: true } },
      },
      orderBy: { name: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.route.findUnique({
      where: { id },
      include: {
        stops: { orderBy: { order: "asc" } },
        buses: {
          include: {
            driver: { include: { user: { select: { email: true, phone: true } } } },
          },
        },
      },
    });
  },

  async create(data: any) {
    return prisma.route.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color ?? "#6366F1",
        stops: { create: data.stops },
      },
      include: { stops: { orderBy: { order: "asc" } } },
    });
  },

  async update(id: string, data: any) {
    return prisma.route.update({ where: { id }, data });
  },

  async addStop(routeId: string, data: any) {
    return prisma.stop.create({ data: { routeId, ...data } });
  },

  async removeStop(stopId: string) {
    return prisma.stop.delete({ where: { id: stopId } });
  },

  async delete(id: string) {
    return prisma.route.delete({ where: { id } });
  }
};
