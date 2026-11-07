import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { TechBadge } from '../../components/ui/TechBadge';
import { TechDialog } from '../../components/ui/TechDialog';
import { TechSelect } from '../../components/ui/TechSelect';
import { Search, Eye, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';

export function AdminAppointments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Status modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('CONFIRMED');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let params = '';
      const parts = [];
      if (statusFilter !== 'ALL') {
        parts.push(`status=${encodeURIComponent(statusFilter)}`);
      }
      if (search.trim()) {
        parts.push(`search=${encodeURIComponent(search.trim())}`);
      }
      if (parts.length > 0) {
        params = `?${parts.join('&')}`;
      }

      const data = await api.getAdminBookings(params);
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch admin bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleOpenStatusModal = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.appointment_status);
    setNotes('');
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setUpdating(true);
    try {
      await api.updateAppointmentStatus(selectedBooking.id, newStatus, notes);
      setStatusModalOpen(false);
      fetchBookings();
    } catch (err) {
      alert(err.message || "Failed to update appointment status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-techgrey-300 p-6 sm:p-8 font-quantico space-y-6">
      <div className="pb-6 border-b border-techgrey-300">
        <div className="text-xs font-bold uppercase tracking-widest text-electric">
          WORKBENCH INTAKE QUEUE
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-graphite-900 mt-1">
          APPOINTMENT BOOKINGS MASTER
        </h1>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-offwhite-50 border border-techgrey-200 p-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-techgrey-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="SEARCH BY REF OR DEVICE..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-techgrey-300 text-xs font-quantico uppercase outline-none focus:border-electric"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border ${
                statusFilter === st
                  ? 'bg-graphite-900 border-graphite-900 text-white'
                  : 'bg-white border-techgrey-300 text-graphite-700 hover:border-graphite-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs uppercase font-bold text-techgrey-500">
          FILTERING APPOINTMENT DATA...
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center text-xs uppercase font-bold text-techgrey-500 border border-techgrey-200 bg-offwhite-50">
          NO MATCHING BOOKINGS FOUND.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs uppercase border-collapse">
            <thead>
              <tr className="border-b border-techgrey-300 bg-offwhite-100 text-techgrey-600">
                <th className="py-2.5 px-3">REF CODE</th>
                <th className="py-2.5 px-3">HARDWARE UNIT</th>
                <th className="py-2.5 px-3">SLOT DATE & TIME</th>
                <th className="py-2.5 px-3">APPOINTMENT STATUS</th>
                <th className="py-2.5 px-3">REPAIR STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-techgrey-200">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-offwhite-50">
                  <td className="py-3 px-3 font-mono font-bold text-electric">
                    {b.reference_code}
                  </td>
                  <td className="py-3 px-3 font-bold text-graphite-900">
                    {b.device_brand} {b.device_model}
                    <div className="text-[10px] text-techgrey-500 font-normal">{b.device_type}</div>
                  </td>
                  <td className="py-3 px-3">
                    {b.slot?.slot_date}
                    <div className="text-[10px] text-techgrey-500">{b.slot?.start_time}</div>
                  </td>
                  <td className="py-3 px-3">
                    <TechBadge status={b.appointment_status} />
                  </td>
                  <td className="py-3 px-3">
                    <TechBadge status={b.repair_status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleOpenStatusModal(b)}
                      className="px-2.5 py-1 border border-techgrey-300 hover:border-graphite-900 text-[10px] font-bold uppercase transition-colors"
                    >
                      UPDATE STATUS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* APPOINTMENT STATUS MODAL */}
      <TechDialog
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="UPDATE APPOINTMENT STATUS"
        subtitle={`BOOKING REF: ${selectedBooking?.reference_code}`}
      >
        {selectedBooking && (
          <form onSubmit={handleSaveStatus} className="space-y-4 text-xs uppercase">
            <div className="bg-offwhite-50 border border-techgrey-200 p-3 space-y-1">
              <div>DEVICE: <strong>{selectedBooking.device_brand} {selectedBooking.device_model}</strong></div>
              <div>REPORTED: <strong>{selectedBooking.problem_description}</strong></div>
            </div>

            <TechSelect
              label="APPOINTMENT STATUS"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[
                { value: 'PENDING', label: 'PENDING (AWAITING REVIEW)' },
                { value: 'CONFIRMED', label: 'CONFIRMED (INTAKE APPROVED)' },
                { value: 'COMPLETED', label: 'COMPLETED (CHECKED IN AT WORKSHOP)' },
                { value: 'REJECTED', label: 'REJECTED (RELEASE SLOT)' },
                { value: 'CANCELLED', label: 'CANCELLED (RELEASE SLOT)' },
              ]}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-graphite-900">
                SUPERVISOR NOTES / REASON (SENT TO CUSTOMER NOTIFICATION FEED)
              </label>
              <textarea
                rows={3}
                placeholder="E.G. INTAKE TIME CONFIRMED WITH LEAD TECHNICIAN"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs font-quantico p-2.5 border border-techgrey-300 rounded-none uppercase outline-none focus:border-electric"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-techgrey-200">
              <TechButton variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
                CANCEL
              </TechButton>
              <TechButton variant="primary" size="sm" type="submit" loading={updating} chamfer>
                COMMIT STATUS CHANGE
              </TechButton>
            </div>
          </form>
        )}
      </TechDialog>
    </div>
  );
}
