import prisma from "@route-pulse/db";

export const BookingRepository = {
  async getActiveBookingForUser(studentUserId: string) {
    // We must find the student ID first or join via the user relation
    const student = await prisma.student.findUnique({ where: { userId: studentUserId } });
    if (!student) return null;

    return prisma.booking.findFirst({
      where: {
        studentId: student.id,
        status: { in: ["confirmed", "pending"] },
      },
      include: {
        bus: {
          include: {
            route: { include: { stops: { orderBy: { order: "asc" } } } },
            seats: true,
          },
        },
        seat: true,
      },
    });
  },

  async countActiveBookings() {
    return prisma.booking.count({
      where: {
        status: { in: ["confirmed", "pending"] },
      },
    });
  },

  async findBookingsByStudentId(studentId: string, status?: string, limit: number = 20) {
    return prisma.booking.findMany({
      where: {
        studentId,
        ...(status ? { status: status as "pending" } : {}), // Narrow string to literal
      },
      include: {
        bus: { include: { route: true } },
        seat: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async findBooking(studentId: string, busId: string, seatId: string) {
    return prisma.booking.findFirst({
      where: { studentId, busId, seatId },
    });
  },

  async confirmBooking(bookingId: string) {
    return prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "confirmed" },
      });

      await tx.seat.update({
        where: { id: b.seatId },
        data: { status: "booked", bookedBy: b.studentId },
      });

      return b;
    });
  },

  async createBooking(data: { studentId: string, busId: string, seatId: string, routeId?: string }) {
    return prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          ...data,
          status: "pending",
        },
      });

      await tx.seat.update({
        where: { id: data.seatId },
        data: { status: "booked", bookedBy: data.studentId },
      });

      return b;
    });
  }
};
