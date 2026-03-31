import prisma from "@route-pulse/db";

export const SeatRepository = {
  async getSeatsByBusId(busId: string) {
    return prisma.seat.findMany({
      where: { busId },
      select: { id: true, busId: true, seatNumber: true, status: true, bookedBy: true },
      orderBy: { seatNumber: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.seat.findUnique({
      where: { id },
      select: { id: true, busId: true, status: true },
    });
  },

  async getStudentProfileByUserId(userId: string) {
    return prisma.student.findUnique({
      where: { userId },
    });
  },

  async hasActiveBooking(studentId: string) {
    const active = await prisma.booking.findFirst({
      where: { studentId, status: { in: ["pending", "confirmed"] } },
    });
    return !!active;
  },

  async confirmBookingAndSeat(studentId: string, busId: string, seatId: string, routeId?: string) {
    return prisma.$transaction(async (tx) => {
      const seat = await tx.seat.findUnique({ where: { id: seatId }, select: { status: true } });
      if (!seat) throw new Error("Seat not found");
      if (seat.status === "booked") throw new Error("Seat already booked by another student");

      await tx.seat.update({
        where: { id: seatId },
        data: { status: "booked", bookedBy: studentId },
      });

      return tx.booking.create({
        data: {
          studentId: studentId,
          busId: busId,
          seatId: seatId,
          routeId: routeId,
          status: "confirmed",
        },
        include: { seat: true, bus: { include: { route: true } } },
      });
    });
  },

  async getBookingForCancellation(bookingId: string) {
    return prisma.booking.findUnique({
      where: { id: bookingId },
      include: { student: true, seat: true },
    });
  },

  async cancelBookingTransaction(bookingId: string, seatId: string) {
    return prisma.$transaction([
      prisma.booking.update({ where: { id: bookingId }, data: { status: "cancelled" } }),
      prisma.seat.update({ where: { id: seatId }, data: { status: "available", bookedBy: null } }),
    ]);
  }
};
