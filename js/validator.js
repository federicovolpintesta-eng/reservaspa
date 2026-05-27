/**
 * Validates if a requested slot is available based on capacity and business hours.
 * MAX 2 bookings per time slot.
 *
 * @param {string} date - Date in YYYY-MM-DD format.
 * @param {string} startTime - Start time in HH:mm format.
 * @param {number} durationMinutes - Duration of the service in minutes.
 * @param {Array} existingBookings - Array of booking objects.
 * @param {Array} blockedSlots - Array of { date, time } blocked objects.
 * @returns {Object} - { available: boolean, message: string }
 */
function validateBooking(date, startTime, durationMinutes, existingBookings, blockedSlots = []) {
    // 0. Check if slot is manually blocked
    const isBlocked = blockedSlots.some(b => b.date === date && b.time === startTime);
    if (isBlocked) {
        return { available: false, message: "Este turno está bloqueado por administración." };
    }

    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    // Don't allow bookings in the past or for the current time if it has already started
    const now = new Date();
    if (start <= now) {
        return { available: false, message: "No se puede reservar un turno que ya ha comenzado o pasado." };
    }

    const startHour = start.getHours();
    const startMinutes = start.getMinutes();

    // 1. Business Hours Validation: 09:00–13:00 and 16:30–20:30
    const isInMorning = (startHour >= 9 && startHour < 13);
    const isInAfternoon = (startHour >= 16 && startHour <= 19);

    if (!isInMorning && !isInAfternoon) {
        return { available: false, message: "Horario fuera de atención. (09:00–13:00 / 16:30–20:30)" };
    }

    // 2. Capacity Validation: MAX 2 per slot
    const concurrentBookings = existingBookings.filter(b => {
        if (b.date !== date) return false;

        const bStart = new Date(`${b.date}T${b.start_time}:00`);
        const bDuration = b.duration || 60;
        const bEnd = new Date(bStart.getTime() + bDuration * 60000);

        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        return (start < bEnd && end > bStart);
    });

    if (concurrentBookings.length >= 2) {
        return { available: false, message: "Turno ocupado. Solo se permiten 2 reservas por horario." };
    }

    return { available: true, message: "Horario disponible." };
}
