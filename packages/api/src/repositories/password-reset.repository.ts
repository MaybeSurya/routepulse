import prisma from "@route-pulse/db";

export const PasswordResetRepository = {
  async createToken(email: string, token: string, expires: Date): Promise<any> {
    // Delete existing tokens for this email first
    await prisma.passwordResetToken.deleteMany({ where: { email } });
    
    return prisma.passwordResetToken.create({
      data: { email, token, expires },
    });
  },

  async findByToken(token: string): Promise<any> {
    return prisma.passwordResetToken.findUnique({
      where: { token },
    });
  },

  async deleteByToken(token: string): Promise<any> {
    return prisma.passwordResetToken.delete({
      where: { token },
    });
  },

  async deleteByEmail(email: string): Promise<any> {
    return prisma.passwordResetToken.deleteMany({
      where: { email },
    });
  },
};
