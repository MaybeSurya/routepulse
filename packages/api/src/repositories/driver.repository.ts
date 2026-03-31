import prisma from "@route-pulse/db";

export const DriverRepository = {
  /**
   * Finds a driver by their driverId badge number, including the joined user profile (for auth)
   */
  async findByDriverIdWithAuthProfile(driverId: string) {
    return prisma.driver.findUnique({
      where: { driverId },
      include: { user: { select: { id: true, role: true, passwordHash: true } } },
    });
  },

  /**
   * Finds the assigned buses for a driver by their user ID
   */
  async getAssignedBusesByUserId(userId: string) {
    return prisma.driver.findUnique({
      where: { userId },
      select: {
        driverId: true,
        id: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        licenseNumber: true,
        isActive: true,
        user: { select: { id: true, email: true, phone: true, erpId: true, firstName: true, lastName: true } },
        buses: {
          include: {
            route: {
              include: { stops: { orderBy: { order: "asc" } } },
            },
            seats: true,
          },
        },
      },
    });
  },
};
