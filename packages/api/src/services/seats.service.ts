import { SeatRepository } from "../repositories/seat.repository";
import { TRPCError } from "@trpc/server";
import { broadcastSeatUpdate } from "../lib/realtime";
import { Redis } from "@upstash/redis";
import { env } from "@route-pulse/env/server";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const HOLD_TTL_SECONDS = 120; // 2 minutes

function seatHoldKey(busId: string, seatId: string): string {
  return `seat:hold:${busId}:${seatId}`;
}

function studentHoldKey(studentId: string): string {
  return `student:hold:${studentId}`;
}

// ─── Redis Operations ───
export async function redisHoldSeat(
  busId: string,
  seatId: string,
  studentId: string,
): Promise<{ held: boolean; expiresIn: number }> {
  const key = seatHoldKey(busId, seatId);
  const studentKey = studentHoldKey(studentId);

  const existingHold = await redis.get<string>(studentKey);
  if (existingHold && existingHold !== seatId) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "You already have a seat on hold. Release it first.",
    });
  }

  // Use a transaction to ensure both references are set atomically
  // Note: @upstash/redis multi() works slightly differently than ioredis
  // We check nx on the seat key first.
  const isHeld = await redis.set(key, studentId, { nx: true, ex: HOLD_TTL_SECONDS });
  
  if (!isHeld) return { held: false, expiresIn: 0 };

  // Set the student's reference
  await redis.set(studentKey, seatId, { ex: HOLD_TTL_SECONDS });
  
  return { held: true, expiresIn: HOLD_TTL_SECONDS };
}

export async function releaseSeatHold(
  busId: string,
  seatId: string,
  studentId: string,
): Promise<void> {
  const key = seatHoldKey(busId, seatId);
  const held = await redis.get<string>(key);

  if (held && held !== studentId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You don't hold this seat" });
  }

  const pipeline = redis.pipeline();
  pipeline.del(key);
  pipeline.del(studentHoldKey(studentId));
  await pipeline.exec();
}

export async function getSeatHolder(busId: string, seatId: string): Promise<string | null> {
  return redis.get<string>(seatHoldKey(busId, seatId));
}

export async function getBusHeldSeats(busId: string, seatIds: string[]): Promise<Set<string>> {
  if (seatIds.length === 0) return new Set();

  const keys = seatIds.map((id) => seatHoldKey(busId, id));
  const values = await redis.mget<(string | null)[]>(...keys);

  const held = new Set<string>();
  values.forEach((v, i) => {
    if (v) held.add(seatIds[i]!);
  });
  return held;
}

export async function getSeatHoldTTL(busId: string, seatId: string): Promise<number> {
  const key = seatHoldKey(busId, seatId);
  const ttl = await redis.ttl(key);
  return Math.max(ttl, 0);
}

// ─── Service Layer Methods ───
export const SeatsService = {
  async getSeatsWithHolds(busId: string) {
    const seats = await SeatRepository.getSeatsByBusId(busId);
    const seatIds = seats.map((s) => s.id);
    const heldSet = await getBusHeldSeats(busId, seatIds);

    const enriched = await Promise.all(
      seats.map(async (seat) => {
        let status = seat.status as string;
        let holdExpiresIn: number | null = null;

        if (seat.status === "available" && heldSet.has(seat.id)) {
          status = "held";
          holdExpiresIn = await getSeatHoldTTL(busId, seat.id);
        }

        return { ...seat, status, holdExpiresIn };
      }),
    );

    return enriched;
  },

  async holdSeat(busId: string, seatId: string, userId: string) {
    const seat = await SeatRepository.findById(seatId);
    if (!seat) throw new TRPCError({ code: "NOT_FOUND", message: "Seat not found" });
    if (seat.busId !== busId) throw new TRPCError({ code: "BAD_REQUEST", message: "Seat not on this bus" });
    if (seat.status === "booked") throw new TRPCError({ code: "CONFLICT", message: "Seat already booked" });

    const student = await SeatRepository.getStudentProfileByUserId(userId);
    if (!student) throw new TRPCError({ code: "NOT_FOUND", message: "Student profile not found" });

    const hasActive = await SeatRepository.hasActiveBooking(student.id);
    if (hasActive) throw new TRPCError({ code: "CONFLICT", message: "You already have an active booking" });

    const { held, expiresIn } = await redisHoldSeat(busId, seatId, student.id);
    if (!held) throw new TRPCError({ code: "CONFLICT", message: "Seat is already being held by another student" });

    await broadcastSeatUpdate(busId, seatId, "held", student.id);

    return {
      seatId,
      studentId: student.id,
      holdExpiresIn: expiresIn,
      holdUntil: new Date(Date.now() + HOLD_TTL_SECONDS * 1000).toISOString(),
    };
  },

  async confirmSeat(busId: string, seatId: string, userId: string, routeId?: string) {
    const student = await SeatRepository.getStudentProfileByUserId(userId);
    if (!student) throw new TRPCError({ code: "NOT_FOUND", message: "Student profile not found" });

    const holder = await getSeatHolder(busId, seatId);
    if (holder !== student.id) {
      throw new TRPCError({ code: "CONFLICT", message: "Hold expired or not held by you. Please hold the seat again." });
    }

    try {
      const booking = await SeatRepository.confirmBookingAndSeat(student.id, busId, seatId, routeId);
      await releaseSeatHold(busId, seatId, student.id);
      await broadcastSeatUpdate(busId, seatId, "booked", student.id);

      const { LogService } = await import("./log.service");
      await LogService.info("SEAT_BOOKED", `Seat ${seatId.slice(-2)} booked on Bus ${busId}`, { studentId: student.id, seatId }, userId, busId);

      return booking;
    } catch (e: any) {
      if (e.message.includes("not found")) throw new TRPCError({ code: "NOT_FOUND", message: e.message });
      throw new TRPCError({ code: "CONFLICT", message: e.message });
    }
  },

  async releaseSeat(busId: string, seatId: string, userId: string) {
    const student = await SeatRepository.getStudentProfileByUserId(userId);
    if (!student) throw new TRPCError({ code: "NOT_FOUND", message: "Student profile not found" });

    await releaseSeatHold(busId, seatId, student.id);
    await broadcastSeatUpdate(busId, seatId, "available");
    return { released: true };
  },

  async cancelBooking(bookingId: string, userSub: string, userRole: string) {
    const booking = await SeatRepository.getBookingForCancellation(bookingId);
    if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });

    const isOwner = booking.student.userId === userSub;
    const isAdmin = ["transport_admin", "super_admin"].includes(userRole);
    if (!isOwner && !isAdmin) throw new TRPCError({ code: "FORBIDDEN", message: "Not your booking" });

    await SeatRepository.cancelBookingTransaction(bookingId, booking.seatId);
    await broadcastSeatUpdate(booking.busId, booking.seatId, "available");
    return { cancelled: true };
  }
};
