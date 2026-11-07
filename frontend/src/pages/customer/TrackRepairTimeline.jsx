import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { TechBadge } from '../../components/ui/TechBadge';
import { ArrowLeft, Clock, Hammer, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

export function TrackRepairTimeline() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [bData, uData] = await Promise.all([
          api.getBookingDetail(bookingId),
          api.getBookingUpdates(bookingId)
        ]);
        setBooking(bData);
        setUpdates(uData);
      } catch (err) {
        setError(err.message || "Failed to load repair history.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="bg-white border border-techgrey-300 p-12 text-center text-xs uppercase font-bold text-techgrey-500 font-quantico">
        RETRIEVING BENCH AUDIT LOGS...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="bg-white border border-crimson p-8 text-center space-y-4 font-quantico">
        <AlertCircle className="w-8 h-8 text-crimson mx-auto" />
        <h2 className="text-base font-bold uppercase text-graphite-900">REPAIR RECORD NOT FOUND</h2>
        <p className="text-xs text-techgrey-600 uppercase">{error}</p>
        <Link to="/portal/appointments">
          <TechButton variant="outline" size="sm" icon={ArrowLeft}>
            BACK TO APPOINTMENTS
          </TechButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-techgrey-300 p-6 sm:p-8 font-quantico space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-techgrey-300 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/portal/appointments" className="text-xs text-techgrey-500 hover:text-electric flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              APPOINTMENTS
            </Link>
            <span className="text-techgrey-400">/</span>
            <span className="text-xs font-bold text-electric uppercase font-mono">{booking.reference_code}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-graphite-900">
            BENCH REPAIR PROGRESS TIMELINE
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <TechBadge status={booking.appointment_status} />
          <TechBadge status={booking.repair_status} />
        </div>
      </div>

      {/* Device & Service Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs uppercase border border-techgrey-200 p-4 bg-offwhite-50">
        <div>
          <div className="text-[10px] text-techgrey-500">HARDWARE UNIT</div>
          <div className="font-bold text-graphite-900 mt-0.5">{booking.device_brand} {booking.device_model}</div>
          <div className="text-[10px] text-techgrey-400">{booking.device_type}</div>
        </div>
        <div>
          <div className="text-[10px] text-techgrey-500">SERVICE SPECIFICATION</div>
          <div className="font-bold text-graphite-900 mt-0.5">{booking.service?.name || 'BENCH INTAKE'}</div>
        </div>
        <div>
          <div className="text-[10px] text-techgrey-500">INTAKE DATE</div>
          <div className="font-bold text-graphite-900 mt-0.5">{booking.slot?.slot_date}</div>
          <div className="text-[10px] text-techgrey-400">{booking.slot?.start_time} - {booking.slot?.end_time}</div>
        </div>
        <div>
          <div className="text-[10px] text-techgrey-500">QUOTED BENCH COST</div>
          <div className="font-bold text-electric text-sm mt-0.5">
            {booking.quoted_price ? `$${booking.quoted_price.toFixed(2)}` : 'UPON DIAGNOSIS'}
          </div>
          {booking.final_price && (
            <div className="text-[10px] text-green font-bold">FINAL: ${booking.final_price.toFixed(2)}</div>
          )}
        </div>
      </div>

      {/* Reported Symptoms */}
      <div className="text-xs uppercase bg-white border border-techgrey-200 p-4 space-y-1">
        <span className="font-bold text-graphite-900">REPORTED DEFECT & SYMPTOMS: </span>
        <p className="text-graphite-700 leading-relaxed mt-1">{booking.problem_description}</p>
        {booking.additional_notes && (
          <p className="text-techgrey-500 text-[11px] pt-1 border-t border-techgrey-200 mt-2">
            NOTES: {booking.additional_notes}
          </p>
        )}
      </div>

      {/* Vertical Timeline */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between border-b border-techgrey-200 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-graphite-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-electric" />
            CHRONOLOGICAL BENCH LOGS ({updates.length})
          </h2>
          <span className="text-[10px] text-techgrey-500 uppercase">AUDIT TRAIL VERIFIED</span>
        </div>

        {updates.length === 0 ? (
          <div className="bg-offwhite-50 border border-techgrey-300 p-8 text-center space-y-2">
            <div className="text-xs font-bold uppercase text-graphite-900">NO BENCH ENTRIES LOGGED YET</div>
            <p className="text-[11px] text-techgrey-500 uppercase">
              Once your hardware arrives at Workshop Bay 4, our technicians will log live circuit inspection and test results here.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-graphite-900 ml-4 pl-6 space-y-8">
            {updates.map((up) => (
              <div key={up.id} className="relative space-y-2">
                {/* Node marker */}
                <span className="absolute -left-[31px] top-1 w-3 h-3 bg-electric border-2 border-white rounded-none shadow-sm" />

                <div className="flex flex-wrap items-center gap-3">
                  <TechBadge status={up.new_status} />
                  <span className="text-xs text-techgrey-500 uppercase">
                    {new Date(up.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="bg-offwhite-50 border border-techgrey-200 p-4 text-xs text-graphite-800 uppercase leading-relaxed">
                  {up.note}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
