import { UserRepository } from "../repositories/user.repository";
import { DriverRepository } from "../repositories/driver.repository";
import { TRPCError } from "@trpc/server";
import { hashPassword, comparePassword, signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { PasswordResetRepository } from "../repositories/password-reset.repository";
import { MailService } from "./mail.service";
import crypto from "crypto";

export const AuthService = {
  async registerStudent(input: any) {
    if (!input.email) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Email is required for registration" });
    }
    const existing = await UserRepository.findFirstMatchingIdentifiers({
      email: input.email,
      phone: input.phone,
      erpId: input.erpId,
    });

    if (existing) {
      throw new TRPCError({ code: "CONFLICT", message: "Account already exists with these credentials" });
    }

    const passwordHash = await hashPassword(input.password);

    const user = await UserRepository.createWithStudentProfile({
      email: input.email,
      phone: input.phone,
      erpId: input.erpId,
      passwordHash,
      student: {
        universityId: input.universityId,
        enrollmentYear: input.enrollmentYear,
        departmentName: input.departmentName,
      },
    });

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken(user.id);

    await UserRepository.updateRefreshToken(user.id, refreshToken);

    return { success: true, data: { accessToken, refreshToken, user } };
  },

  async loginStudent(input: any) {
    const { identifier, password } = input;
    console.log(`[AuthService] Attempting student login: ${identifier}`);

    const user = await UserRepository.findByExactIdentifier(identifier, "student");
    if (!user) {
      console.warn(`[AuthService] Student not found: ${identifier}`);
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      console.warn(`[AuthService] Password mismatch for student: ${identifier}`);
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken(user.id);

    await UserRepository.updateRefreshToken(user.id, refreshToken);

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, phone: user.phone, erpId: user.erpId, role: user.role, isVerified: user.isVerified },
      },
    };
  },

  async loginDriver(input: any) {
    console.log(`[AuthService] Attempting driver login: ${input.driverId}`);
    const driver = await DriverRepository.findByDriverIdWithAuthProfile(input.driverId);

    if (!driver) {
      console.warn(`[AuthService] Driver not found: ${input.driverId}`);
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid driver credentials" });
    }

    const isMatch = await comparePassword(input.pin, driver.user.passwordHash);
    if (!isMatch) {
      console.warn(`[AuthService] PIN mismatch for driver: ${input.driverId}`);
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid driver credentials" });
    }

    if (!driver.isActive) {
      console.warn(`[AuthService] Driver inactive: ${input.driverId}`);
      throw new TRPCError({ code: "FORBIDDEN", message: "Driver account is inactive" });
    }

    const accessToken = signAccessToken({ sub: driver.user.id, role: driver.user.role });
    const refreshToken = signRefreshToken(driver.user.id);

    await UserRepository.updateRefreshToken(driver.user.id, refreshToken);

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        driver: { id: driver.id, driverId: driver.driverId, role: driver.user.role },
      },
    };
  },

  async loginAdmin(input: any) {
    console.log(`[AuthService] Attempting admin login: ${input.email}`);
    const user = await UserRepository.findAdminByEmail(input.email);

    if (!user) {
      console.warn(`[AuthService] Admin not found: ${input.email}`);
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin credentials" });
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      console.warn(`[AuthService] Password mismatch for admin: ${input.email}`);
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin credentials" });
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken(user.id);
    await UserRepository.updateRefreshToken(user.id, refreshToken);

    return { success: true, data: { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } } };
  },

  async refreshToken(input: any) {
    const { sub } = verifyRefreshToken(input.refreshToken);

    const user = await UserRepository.findById(sub);

    if (!user || user.refreshToken !== input.refreshToken) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Refresh token mismatch or revoked" });
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const newRefreshToken = signRefreshToken(user.id);
    await UserRepository.updateRefreshToken(user.id, newRefreshToken);

    return { success: true, data: { accessToken, refreshToken: newRefreshToken } };
  },

  async logout(userId: string) {
    await UserRepository.updateRefreshToken(userId, null);
    return { success: true };
  },

  async getProfile(userId: string) {
    const user = await UserRepository.findProfileById(userId);
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }
    return { success: true, data: user };
  },

  async requestPasswordReset(email: string) {
    const user = await UserRepository.findByExactIdentifier(email);
    if (!user || !user.email) {
      // For security, don't reveal if user exists
      return { success: true, message: "If an account exists with this email, a reset link has been sent." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await PasswordResetRepository.createToken(user.email, token, expires);
    await MailService.sendPasswordResetEmail(user.email, token);

    return { success: true, message: "If an account exists with this email, a reset link has been sent." };
  },

  async resetPassword(input: any) {
    const { token, password } = input;
    const resetToken = await PasswordResetRepository.findByToken(token);
    
    if (!resetToken || resetToken.expires < new Date()) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired token" });
    }

    const user = await UserRepository.findByExactIdentifier(resetToken.email);
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const passwordHash = await hashPassword(password);
    await UserRepository.updatePassword(user.id, passwordHash);
    await PasswordResetRepository.deleteByToken(token);

    return { success: true, message: "Password has been reset successfully" };
  },
};
