import prisma from "@route-pulse/db";

export const BusRepository = {
  async getStats() {
    const total = await prisma.bus.count();
    const active = await prisma.bus.count({
      where: {
        status: { in: ["en_route", "maintenance"] },
      },
    });
    return { total, active };
  },

  async addLocation(data: {
    busId: string;
    lat: number;
    lng: number;
    speed: number;
    heading?: number;
  }) {
    return prisma.busLocation.create({
      data: {
        busId: data.busId,
        lat: data.lat,
        lng: data.lng,
        speed: data.speed,
        heading: data.heading,
      },
    });
  },

  async getAverageDelayMins() {
    const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000);
    const recentLocs = await prisma.busLocation.aggregate({
      where: { timestamp: { gte: twentyMinsAgo } },
      _avg: { speed: true },
    });

    const avgSpeed = recentLocs._avg.speed || 0;
    if (avgSpeed < 5 && avgSpeed > 0) return 12.5; 
    if (avgSpeed === 0) return 0;
    return 3.2; 
  },

  async findByIdWithRouteAndStops(id: string) {
    return prisma.bus.findUnique({
      where: { id },
      include: {
        route: {
          include: { stops: { orderBy: { order: "asc" } } },
        },
      },
    });
  },

  async findMinimalById(id: string) {
    return prisma.bus.findUnique({
      where: { id },
      select: {
        id: true,
        plateNumber: true,
        status: true,
        lat: true,
        lng: true,
        speed: true,
        heading: true,
        lastStopId: true,
        nextStopId: true,
      },
    });
  },

  async list(status?: string, routeId?: string) {
    return prisma.bus.findMany({
      where: {
        ...(routeId ? { routeId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: {
        route: true,
        driver: {
          include: {
            user: { select: { id: true, email: true, phone: true } },
          },
        },
        _count: { select: { seats: true, bookings: true } },
      },
      orderBy: { plateNumber: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.bus.findUnique({
      where: { id },
      include: {
        route: { include: { stops: { orderBy: { order: "asc" } } } },
        driver: {
          include: { user: { select: { id: true, email: true, phone: true } } },
        },
        locations: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
        seats: { orderBy: { seatNumber: "asc" } },
      },
    });
  },

  async findByPlateNumber(plateNumber: string) {
    return prisma.bus.findUnique({ where: { plateNumber } });
  },

  async createWithSeats(data: any, capacity: number) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.bus.create({ data });

      const half = Math.ceil(capacity / 2);
      const seatData = [];
      for (let i = 1; i <= half; i++) {
        seatData.push({ busId: created.id, seatNumber: `A${i}` });
      }
      for (let i = 1; i <= capacity - half; i++) {
        seatData.push({ busId: created.id, seatNumber: `B${i}` });
      }
      await tx.seat.createMany({ data: seatData });
      return created;
    });
  },

  async update(id: string, data: any) {
    return prisma.bus.update({ where: { id }, data });
  },

  async assignDriver(busId: string, driverId: string) {
    return prisma.bus.update({
      where: { id: busId },
      data: { driverId },
      include: { driver: { include: { user: { select: { email: true } } } } },
    });
  },

  async updateStatus(id: string, status: string) {
    return prisma.bus.update({
      where: { id },
      data: { status: status as any },
    });
  },

  async updateStop(id: string, data: any) {
    return prisma.stop.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.bus.delete({ where: { id } });
  }
};
