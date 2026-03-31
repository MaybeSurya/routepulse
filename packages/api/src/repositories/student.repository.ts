import prisma from "@route-pulse/db";

export const StudentRepository = {
  async countTotal() {
    return prisma.student.count();
  },

  async getProfileByUserId(userId: string) {
    return prisma.student.findUnique({
      where: { userId },
    });
  },

  async getProfileAndActiveBooking(userId: string) {
    return prisma.student.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true, phone: true, erpId: true, isVerified: true } },
        bookings: {
          where: { status: { in: ["confirmed", "pending"] } },
          include: {
            bus: {
              include: {
                route: { include: { stops: { orderBy: { order: "asc" } } } },
                locations: { orderBy: { timestamp: "desc" }, take: 1 },
              },
            },
            seat: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  },

  async createComplaint(userId: string, data: { subject: string, description: string, fileKey?: string | null }) {
    return prisma.complaint.create({
      data: {
        userId,
        subject: data.subject,
        description: data.description,
        fileKey: data.fileKey,
      },
    });
  },

  async findComplaintsByUserId(userId: string) {
    return prisma.complaint.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findAvailableBusOnRoute(routeId: string) {
    return prisma.bus.findFirst({
      where: {
        routeId,
        status: { in: ["en_route", "arrived"] }
      }
    });
  },

  async findAvailableSeat(busId: string) {
    return prisma.seat.findFirst({
      where: {
        busId,
        status: "available"
      }
    });
  }
};
