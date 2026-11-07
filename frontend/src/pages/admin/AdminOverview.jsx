import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { TechBadge } from '../../components/ui/TechBadge';
import { 
  Clock, CheckCircle2, AlertCircle, Wrench, Users, Hammer, 
  ArrowRight, Check, X 
} from 'lucide-react';

export function AdminOverview() {
  const [metrics, setMetrics] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const [m, b] = await Promise.all([
        api.getDashboardMetrics(),
        api.getAdminBookings('?status=PENDING')
      ]);
      setMetrics(m);
      setPendingBookings(b.slice(0, 10));
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await api.updateAppointmentStatus(bookingId, newStatus, `Processed by supervisor`);
      loadDashboard();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6 font-quantico">
      {/* Top Header */}
      <div className="bg-graphite-900 text-offwhite-100 p-6 border border-graphite-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-bold text-electric tracking-widest">
            SUPERVISOR TELEMETRY
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white mt-1">
            WORKBENCH OPERATIONS DASHBOARD
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/slots">
            <TechButton variant="outlineWhite" size="sm">
              MANAGE SLOTS
            </TechButton>
          </Link>
          <Link to="/admin/repairs">
            <TechButton variant="primary" size="sm" chamfer icon={Hammer}>
              BENCH WORKBENCH
            </TechButton>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs uppercase font-bold text-techgrey-500">
          COMPILING WORKSHOP METRICS...
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-amber p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-amber">
                <span>PENDING APPROVALS</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-3xl font-bold text-graphite-900 mt-2 font-mono">
                {metrics?.pending_appointments || 0}
              </div>
              <div className="text-[10px] text-techgrey-500 uppercase mt-1">AWAITING INTAKE CONFIRMATION</div>
            </div>

            <div className="bg-white border-2 border-electric p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-electric">
                <span>ACTIVE ON BENCH</span>
                <Hammer className="w-4 h-4" />
              </div>
              <div className="text-3xl font-bold text-graphite-900 mt-2 font-mono">
                {metrics?.active_bench_repairs || 0}
              </div>
              <div className="text-[10px] text-techgrey-500 uppercase mt-1">IN DIAGNOSIS / REPAIR</div>
            </div>

            <div className="bg-white border-2 border-green p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-green">
                <span>READY FOR PICKUP</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-3xl font-bold text-graphite-900 mt-2 font-mono">
                {metrics?.ready_for_pickup || 0}
              </div>
              <div className="text-[10px] text-techgrey-500 uppercase mt-1">TESTED & READY AT BAY 4</div>
            </div>

            <div className="bg-white border border-techgrey-300 p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-graphite-900">
                <span>REGISTERED CLIENTS</span>
                <Users className="w-4 h-4 text-techgrey-500" />
              </div>
              <div className="text-3xl font-bold text-graphite-900 mt-2 font-mono">
                {metrics?.total_customers || 0}
              </div>
              <div className="text-[10px] text-techgrey-500 uppercase mt-1">TOTAL SERVICED: {metrics?.total_completed || 0}</div>
            </div>
          </div>

          {/* Pending Inward Queue */}
          <div className="bg-white border border-techgrey-300 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-techgrey-200 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-graphite-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber" />
                PENDING INTAKE APPOINTMENTS QUEUE ({pendingBookings.length})
              </h2>
              <Link to="/admin/appointments" className="text-xs text-electric hover:underline uppercase font-bold">
                VIEW ALL APPOINTMENTS
              </Link>
            </div>

            {pendingBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-techgrey-500 uppercase">
                NO PENDING INTAKE APPOINTMENTS REQUIRING SUPERVISOR REVIEW.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs uppercase border-collapse">
                  <thead>
                    <tr className="border-b border-techgrey-300 bg-offwhite-100 text-techgrey-600">
                      <th className="py-2.5 px-3">REFERENCE</th>
                      <th className="py-2.5 px-3">HARDWARE</th>
                      <th className="py-2.5 px-3">SCHEDULED SLOT</th>
                      <th className="py-2.5 px-3">SYMPTOMS</th>
                      <th className="py-2.5 px-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-techgrey-200">
                    {pendingBookings.map((b) => (
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
                        <td className="py-3 px-3 max-w-xs truncate text-graphite-700">
                          {b.problem_description}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                            className="px-2.5 py-1 bg-green text-white text-[10px] font-bold uppercase hover:bg-green-700"
                          >
                            CONFIRM
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-crimson text-white text-[10px] font-bold uppercase hover:bg-red-700"
                          >
                            REJECT
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
