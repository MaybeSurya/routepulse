import prisma from "@route-pulse/db";
import { broadcastLog } from "../lib/realtime";

export enum LogLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
}

export const LogService = {
  /**
   * Record a system event and broadcast it to the admin dashboard.
   */
  async record(params: {
    type: LogLevel;
    event: string;
    message?: string;
    metadata?: any;
    userId?: string;
    busId?: string;
  }) {
    const log = await prisma.systemLog.create({
      data: {
        type: params.type as any,
        event: params.event,
        message: params.message,
        metadata: params.metadata,
        userId: params.userId,
        busId: params.busId,
      },
    });

    // Broadcast to Admin Realtime Feed
    await broadcastLog(log as any);

    return log;
  },

  async info(event: string, message?: string, metadata?: any, userId?: string, busId?: string) {
    return this.record({ type: LogLevel.INFO, event, message, metadata, userId, busId });
  },

  async warn(event: string, message?: string, metadata?: any, userId?: string, busId?: string) {
    return this.record({ type: LogLevel.WARNING, event, message, metadata, userId, busId });
  },

  async critical(event: string, message?: string, metadata?: any, userId?: string, busId?: string) {
    return this.record({ type: LogLevel.CRITICAL, event, message, metadata, userId, busId });
  },

  async list(limit: number = 50, offset: number = 0) {
    return prisma.systemLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }
};
