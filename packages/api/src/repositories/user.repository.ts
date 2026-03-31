import prisma from "@route-pulse/db";

export const UserRepository = {
  /**
   * Finds a single user matching any of the provided identifiers (email, phone, or erpId)
   */
  async findFirstMatchingIdentifiers({ email, phone, erpId }: { email?: string; phone?: string; erpId?: string }) {
    return prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
          erpId ? { erpId } : {},
        ].filter((c) => Object.keys(c).length > 0),
      },
    });
  },

  /**
   * Finds a user by a single identifier string (matches email, phone, or erpId) with an optional role filter
   */
  async findByExactIdentifier(identifier: string, role?: string | string[]) {
    return prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          { erpId: identifier },
        ],
        ...(role 
          ? { role: Array.isArray(role) ? { in: role as any[] } : (role as any) } 
          : {}),
      },
      select: { 
        id: true, 
        email: true, 
        phone: true, 
        erpId: true, 
        role: true, 
        passwordHash: true, 
        isVerified: true 
      },
    });
  },

  /**
   * Finds a user by email, specific for admin login
   */
  async findAdminByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
        role: { in: ["transport_admin", "super_admin"] },
      },
      select: { id: true, email: true, role: true, passwordHash: true },
    });
  },

  /**
   * Finds a user by ID
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, refreshToken: true },
    });
  },

  /**
   * Finds a user by ID, joining their student and driver profiles
   */
  async findProfileById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        erpId: true,
        role: true,
        isVerified: true,
        createdAt: true,
        student: { select: { id: true, universityId: true, enrollmentYear: true, departmentName: true } },
        driver: { select: { id: true, driverId: true, licenseNumber: true, isActive: true } },
      },
    });
  },

  /**
   * Creates a user, optionally nesting a student profile
   */
  async createWithStudentProfile(data: {
    email: string;
    phone?: string;
    erpId?: string;
    passwordHash: string;
    student: {
      universityId: string;
      enrollmentYear: number;
      departmentName?: string;
    }
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        erpId: data.erpId,
        role: "student",
        passwordHash: data.passwordHash,
        student: {
          create: data.student,
        },
      },
      select: { id: true, email: true, role: true },
    });
  },

  /**
   * Updates a user's refresh token
   */
  async updateRefreshToken(id: string, refreshToken: string | null) {
    return prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  },

  /**
   * Updates a user's password
   */
  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  },
};
