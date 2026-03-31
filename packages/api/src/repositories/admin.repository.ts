import prisma from "@route-pulse/db";
import type { Role } from "@route-pulse/db";

export const AdminRepository = {
  async getSystemAnalytics() {
    const [
      totalBuses,
      activeBuses,
      arrivedBuses,
      totalStudents,
      totalDrivers,
      totalRoutes,
      activeRoutes,
      confirmedBookings,
      totalSeats,
      bookedSeats,
      openComplaints,
    ] = await Promise.all([
      prisma.bus.count(),
      prisma.bus.count({ where: { status: "en_route" } }),
      prisma.bus.count({ where: { status: "arrived" } }),
      prisma.student.count(),
      prisma.driver.count({ where: { isActive: true } }),
      prisma.route.count(),
      prisma.route.count({ where: { isActive: true } }),
      prisma.booking.count({ where: { status: "confirmed" } }),
      prisma.seat.count(),
      prisma.seat.count({ where: { status: "booked" } }),
      prisma.complaint.count({ where: { status: { in: ["open", "in_review"] } } }),
    ]);

    const occupancyPercent = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;
    const delayedBuses = totalBuses - activeBuses - arrivedBuses;

    return {
      buses: { total: totalBuses, active: activeBuses, arrived: arrivedBuses, delayed: delayedBuses < 0 ? 0 : delayedBuses },
      students: { total: totalStudents },
      drivers: { active: totalDrivers },
      routes: { total: totalRoutes, active: activeRoutes },
      bookings: { confirmed: confirmedBookings },
      seats: { total: totalSeats, booked: bookedSeats, occupancyPercent },
      complaints: { open: openComplaints },
    };
  },

  async listBuses(status?: string, routeId?: string) {
    return prisma.bus.findMany({
      where: {
        ...(status ? { status: status as "en_route" } : {}),
        ...(routeId ? { routeId } : {}),
      },
      include: {
        route: true,
        driver: { include: { user: { select: { email: true, phone: true } } } },
        locations: { orderBy: { timestamp: "desc" }, take: 1 },
        _count: { select: { seats: true, bookings: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async listRoutes() {
    return prisma.route.findMany({
      include: {
        stops: { orderBy: { order: "asc" } },
        _count: { select: { buses: true, bookings: true } },
        buses: {
          select: { id: true, plateNumber: true, status: true, lat: true, lng: true, _count: { select: { bookings: true } } },
        },
      },
      orderBy: { name: "asc" },
    });
  },

  async updateRoute(id: string, data: any) {
    const { stops, busIds, ...routeData } = data;
    
    return prisma.$transaction(async (tx) => {
      // Update route basic info
      const updated = await tx.route.update({
        where: { id },
        data: routeData,
      });

      // Update Bus assignments
      if (busIds) {
        // Disconnect buses that are currently on this route but not in the new list
        await tx.bus.updateMany({
          where: { routeId: id, NOT: { id: { in: busIds } } },
          data: { routeId: null },
        });

        // Connect new buses
        await tx.bus.updateMany({
          where: { id: { in: busIds } },
          data: { routeId: id },
        });
      }

      // If stops are provided, we replace them
      if (stops) {
        await tx.stop.deleteMany({ where: { routeId: id } });
        await tx.stop.createMany({
          data: stops.map((s: any, idx: number) => ({
            ...s,
            routeId: id,
            order: idx,
          })),
        });
      }

      return updated;
    });
  },

  async deleteRoute(id: string) {
    return prisma.route.delete({ where: { id } });
  },

  async createRoute(data: any) {
    const { stops, busIds, ...routeData } = data;
    return prisma.$transaction(async (tx) => {
      const route = await tx.route.create({
        data: {
          ...routeData,
          stops: {
            create: stops?.map((s: any, idx: number) => ({
              ...s,
              order: idx,
            })),
          },
        },
      });

      if (busIds && busIds.length > 0) {
        await tx.bus.updateMany({
          where: { id: { in: busIds } },
          data: { routeId: route.id },
        });
      }

      return route;
    });
  },

  async listStudents(search?: string, limit: number = 50, offset: number = 0) {
    const where = search
      ? {
          OR: [
            { user: { email: { contains: search, mode: "insensitive" as const } } },
            { user: { phone: { contains: search, mode: "insensitive" as const } } },
            { universityId: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, phone: true, erpId: true, isVerified: true, createdAt: true } },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.student.count({ where }),
    ]);

    return { students, total };
  },

  async listDrivers() {
    return prisma.driver.findMany({
      include: {
        user: { select: { id: true, email: true, phone: true } },
        buses: { select: { id: true, plateNumber: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findDriverByDriverId(driverId: string) {
    return prisma.driver.findUnique({ where: { driverId } });
  },

  async findBusByPlateNumber(plateNumber: string) {
    return prisma.bus.findUnique({ where: { plateNumber } });
  },

  async findBusByDriverId(driverId: string) {
    return prisma.bus.findFirst({ where: { driverId } });
  },


  async findRouteByName(name: string) {
    return prisma.route.findFirst({ where: { name } });
  },

  async createDriver(data: any) {
    return prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        role: "driver",
        passwordHash: data.passwordHash,
        isVerified: true,
        driver: {
          create: { 
            driverId: data.driverId, 
            licenseNumber: data.licenseNumber,
          },
        },
      },
      include: { driver: true },
    });
  },

  async createBus(data: any) {
    const { routeId, driverId, ...busData } = data;
    return prisma.bus.create({
      data: {
        ...busData,
        ...(routeId ? { route: { connect: { id: routeId } } } : {}),
        ...(driverId ? { driver: { connect: { id: driverId } } } : {}),
      },
      include: { route: true, driver: true },
    });
  },

  async listComplaints(status?: string) {
    return prisma.complaint.findMany({
      where: status ? { status: status as "open" } : undefined,
      include: {
        user: { select: { id: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async updateComplaint(id: string, data: any) {
    return prisma.complaint.update({ where: { id }, data });
  },

  async createAnnouncement(data: any, authorId: string) {
    return prisma.announcement.create({
      data: { ...data, authorId },
    });
  },

  async routeUsage() {
    return prisma.route.findMany({
      include: {
        _count: { select: { bookings: true, buses: true } },
      },
    });
  },

  async getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async listAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        driver: { select: { driverId: true } },
        student: { select: { universityId: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async updateUserRole(id: string, role: Role) {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  },

  async deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
  },

  async getBusById(id: string) {
    return prisma.bus.findUnique({ where: { id } });
  },

  async getRouteById(id: string) {
    return prisma.route.findUnique({ where: { id } });
  },

  async updateBus(id: string, data: any) {
    const { routeId, driverId, ...busData } = data;
    return prisma.bus.update({
      where: { id },
      data: {
        ...busData,
        ...(routeId ? { route: { connect: { id: routeId } } } : {}),
        ...(driverId ? { driver: { connect: { id: driverId } } } : {}),
      },
    });
  },
  
  async deleteBus(id: string) {
    return prisma.bus.delete({
      where: { id },
    });
  },
};
