import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { TechBadge } from '../../components/ui/TechBadge';
import { TechDialog } from '../../components/ui/TechDialog';
import { TechInput } from '../../components/ui/TechInput';
import { 
  Clock, Calendar, AlertCircle, Eye, XCircle, ArrowRight, CheckCircle2 
} from 'lucide-react';

export function MyAppointments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetBooking, setTargetBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Reschedule modal state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [newSlotId, setNewSlotId] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Fetch slots for reschedule date
  useEffect(() => {
    if (!rescheduleDate) return;
    async function getSlots() {
      setLoadingSlots(true);
      try {
        const slots = await api.getAvailableSlots(`?date=${rescheduleDate}`);
        setAvailableSlots(slots);
        const freeSlot = slots.find(s => !s.is_reserved && s.is_active);
        setNewSlotId(freeSlot ? freeSlot.id : '');
      } catch (err) {
        console.error("Failed to load reschedule slots", err);
      } finally {
        setLoadingSlots(false);
      }
    }
    getSlots();
  }, [rescheduleDate]);

  const handleOpenCancel = (booking) => {
    setTargetBooking(booking);
    setCancelReason('');
    setCancelError(null);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!targetBooking) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await api.cancelBooking(targetBooking.id, cancelReason);
      setCancelModalOpen(false);
      fetchBookings();
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenReschedule = (booking) => {
    setTargetBooking(booking);
    setRescheduleError(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setRescheduleDate(`${yyyy}-${mm}-${dd}`);
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async () => {
    if (!targetBooking || !newSlotId) return;
    setRescheduling(true);
    setRescheduleError(null);
    try {
      await api.rescheduleBooking(targetBooking.id, newSlotId);
      setRescheduleModalOpen(false);
      fetchBookings();
    } catch (err) {
      setRescheduleError(err.message || 'Failed to reschedule appointment slot.');
    } finally {
      setRescheduling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'UPCOMING') return ['PENDING', 'CONFIRMED'].includes(b.appointment_status);
    if (filter === 'COMPLETED') return ['COMPLETED'].includes(b.appointment_status) || ['DELIVERED'].includes(b.repair_status);
    if (filter === 'CANCELLED') return ['CANCELLED', 'REJECTED'].includes(b.appointment_status);
    return true;
  });

  return (
    <div className="bg-white border border-techgrey-300 p-6 sm:p-8 font-quantico space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-techgrey-300 gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-electric">
            WORKBENCH APPOINTMENTS ARCHIVE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-graphite-900 mt-1">
            MY APPOINTMENTS & REPAIRS
          </h1>
        </div>

        <Link to="/portal/book">
          <TechButton variant="primary" size="sm" chamfer icon={Calendar}>
            BOOK NEW INTAKE
          </TechButton>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
              filter === tab
                ? 'bg-graphite-900 border-graphite-900 text-white'
                : 'bg-offwhite-100 border-techgrey-300 text-graphite-800 hover:border-graphite-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs uppercase font-bold text-techgrey-500">
          QUERYING APPOINTMENT ARCHIVES...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-offwhite-50 border border-techgrey-300 p-12 text-center space-y-2">
          <div className="text-sm font-bold uppercase text-graphite-900">NO APPOINTMENTS RECORDED IN THIS CATEGORY</div>
          <p className="text-xs text-techgrey-500 uppercase">
            All your scheduled check-ins and completed bench tickets will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isEligibleForChange = ['PENDING', 'CONFIRMED'].includes(b.appointment_status);

            return (
              <div
                key={b.id}
                className="border border-techgrey-300 p-6 hover:border-graphite-900 transition-colors bg-white space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-techgrey-200 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-graphite-900 font-mono">
                      {b.reference_code}
                    </span>
                    <span className="text-xs text-techgrey-500 uppercase">
                      {new Date(b.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <TechBadge status={b.appointment_status} />
                    <TechBadge status={b.repair_status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs uppercase">
                  <div>
                    <div className="text-techgrey-500 text-[10px]">SERVICE</div>
                    <div className="font-bold text-graphite-900 mt-0.5">{b.service?.name || 'BENCH INTAKE'}</div>
                  </div>
                  <div>
                    <div className="text-techgrey-500 text-[10px]">HARDWARE IDENTIFIER</div>
                    <div className="font-bold text-graphite-900 mt-0.5">{b.device_type} • {b.device_brand} {b.device_model}</div>
                  </div>
                  <div>
                    <div className="text-techgrey-500 text-[10px]">SCHEDULED INTAKE</div>
                    <div className="font-bold text-electric mt-0.5">
                      {b.slot?.slot_date} ({b.slot?.start_time?.substring(0, 5)})
                    </div>
                  </div>
                </div>

                <div className="text-xs text-graphite-700 uppercase bg-offwhite-50 p-3 border border-techgrey-200">
                  <span className="font-bold text-graphite-900">PROBLEM SYMPTOMS: </span>
                  {b.problem_description}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Link to={`/portal/repairs/${b.id}`}>
                    <TechButton variant="secondary" size="sm" icon={Eye}>
                      VIEW BENCH REPAIR LOGS
                    </TechButton>
                  </Link>

                  {isEligibleForChange && (
                    <div className="flex items-center gap-2">
                      <TechButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReschedule(b)}
                      >
                        RESCHEDULE SLOT
                      </TechButton>
                      <TechButton
                        variant="ghost"
                        size="sm"
                        className="text-crimson hover:bg-crimson/10"
                        onClick={() => handleOpenCancel(b)}
                      >
                        CANCEL APPOINTMENT
                      </TechButton>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CANCEL MODAL */}
      <TechDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="CANCEL INTAKE APPOINTMENT"
        subtitle={`RELEASING SLOT FOR ${targetBooking?.reference_code}`}
      >
        <div className="space-y-4 text-xs uppercase">
          {cancelError && (
            <div className="bg-crimson/10 border border-crimson p-3 text-crimson font-bold">
              {cancelError}
            </div>
          )}

          <p className="text-graphite-700">
            Cancelling this appointment will immediately release your reserved 30-minute intake window back into the workshop schedule.
          </p>

          <TechInput
            label="REASON FOR CANCELLATION (OPTIONAL)"
            placeholder="E.G. FIXED ISSUE MYSELF, RESCHEDULING LATER"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-techgrey-200">
            <TechButton variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              GO BACK
            </TechButton>
            <TechButton
              variant="danger"
              size="sm"
              loading={cancelling}
              onClick={handleConfirmCancel}
            >
              CONFIRM CANCELLATION
            </TechButton>
          </div>
        </div>
      </TechDialog>

      {/* RESCHEDULE MODAL */}
      <TechDialog
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="RESCHEDULE INTAKE APPOINTMENT"
        subtitle={`SWAPPING SLOT FOR ${targetBooking?.reference_code}`}
      >
        <div className="space-y-4 text-xs uppercase">
          {rescheduleError && (
            <div className="bg-crimson/10 border border-crimson p-3 text-crimson font-bold">
              {rescheduleError}
            </div>
          )}

          <TechInput
            label="SELECT NEW TARGET DATE"
            type="date"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
          />

          <div>
            <label className="text-[11px] font-bold text-graphite-900 block mb-2">
              AVAILABLE SLOTS FOR {rescheduleDate}:
            </label>

            {loadingSlots ? (
              <div className="p-4 text-center text-techgrey-500">LOADING SLOTS...</div>
            ) : availableSlots.length === 0 ? (
              <div className="p-4 text-center text-techgrey-500 border border-techgrey-200">
                NO SLOTS AVAILABLE ON THIS DATE
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {availableSlots.map((s) => {
                  const isReserved = s.is_reserved;
                  const isSelected = newSlotId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={isReserved || !s.is_active}
                      onClick={() => setNewSlotId(s.id)}
                      className={`p-2 border text-center ${
                        isReserved
                          ? 'bg-techgrey-100 text-techgrey-400 line-through cursor-not-allowed'
                          : isSelected
                          ? 'bg-electric text-white font-bold border-electric'
                          : 'bg-white hover:border-graphite-900'
                      }`}
                    >
                      {s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-techgrey-200">
            <TechButton variant="outline" size="sm" onClick={() => setRescheduleModalOpen(false)}>
              CANCEL
            </TechButton>
            <TechButton
              variant="primary"
              size="sm"
              loading={rescheduling}
              disabled={!newSlotId}
              onClick={handleConfirmReschedule}
            >
              CONFIRM RESCHEDULE
            </TechButton>
          </div>
        </div>
      </TechDialog>
    </div>
  );
}
