import { BookingRepository } from "../repositories/booking.repository";
import { StudentRepository } from "../repositories/student.repository";
import { TRPCError } from "@trpc/server";

export const StudentService = {
  async getProfile(userId: string) {
    const student = await StudentRepository.getProfileAndActiveBooking(userId);
    if (!student) throw new TRPCError({ code: "NOT_FOUND", message: "Student profile not found" });

    const activeBooking = student.bookings[0] ?? null;
    return { student, activeBooking };
  },

  async getAssignedBus(studentUserId: string) {
    const booking = await BookingRepository.getActiveBookingForUser(studentUserId);
    if (!booking) {
      return null;
    }
    
    return {
      status: booking.status,
      id: booking.id,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      routeId: booking.routeId,
      busId: booking.busId,
      studentId: booking.studentId,
      seatId: booking.seatId,
      bus: booking.bus,
      seat: booking.seat,
    };
  },

  async listBookings(userId: string, status?: string, limit: number = 20) {
    const student = await StudentRepository.getProfileByUserId(userId);
    if (!student) throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });

    return BookingRepository.findBookingsByStudentId(student.id, status, limit);
  },

  async submitComplaint(userId: string, data: { subject: string, description: string, fileKey?: string | null }) {
    return StudentRepository.createComplaint(userId, data);
  },

  async listComplaints(userId: string) {
    return StudentRepository.findComplaintsByUserId(userId);
  },

  async bookRoute(userId: string, routeId: string) {
    const student = await StudentRepository.getProfileByUserId(userId);
    if (!student) throw new TRPCError({ code: "NOT_FOUND", message: "Student profile not found" });

    // Check for existing active booking
    const active = await BookingRepository.getActiveBookingForUser(userId);
    if (active) {
      throw new TRPCError({ code: "CONFLICT", message: "You already have an active booking" });
    }

    // Find a bus for this route (simplification: first active bus)
    const bus = await StudentRepository.findAvailableBusOnRoute(routeId);
    if (!bus) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No active buses found for this route" });
    }

    // Find an available seat
    const seatSelection = await StudentRepository.findAvailableSeat(bus.id);
    if (!seatSelection) {
      throw new TRPCError({ code: "FORBIDDEN", message: "No seats available on this bus" });
    }

    return BookingRepository.createBooking({
      studentId: student.id,
      busId: bus.id,
      routeId: routeId,
      seatId: seatSelection.id
    });
  }
};
