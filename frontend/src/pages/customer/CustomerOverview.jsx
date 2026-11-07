import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { TechBadge } from '../../components/ui/TechBadge';
import { 
  CalendarPlus, Clock, Wrench, AlertCircle, ArrowRight, Bell, CheckCircle2 
} from 'lucide-react';

export function CustomerOverview() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [bData, nData] = await Promise.all([
          api.getMyBookings(),
          api.getNotifications()
        ]);
        setBookings(bData);
        setNotifications(nData.slice(0, 5));
      } catch (err) {
        console.error("Failed to load overview data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeBooking = bookings.find(b => 
    !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.appointment_status) ||
    !['DELIVERED'].includes(b.repair_status)
  );

  return (
    <div className="space-y-6 font-quantico">
      {/* Top Welcome Banner */}
      <div className="bg-graphite-900 text-offwhite-100 p-6 border-2 border-graphite-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-bold text-electric tracking-widest">
            AUTHENTICATED CUSTOMER WORKBENCH
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white mt-1">
            WELCOME, {user?.name}
          </h1>
          <p className="text-xs text-techgrey-400 uppercase mt-0.5">
            ACCOUNT REF: {user?.id?.substring(0, 8)} • REGISTERED PHONE: {user?.phone}
          </p>
        </div>

        <Link to="/portal/book">
          <TechButton variant="primary" size="md" chamfer icon={CalendarPlus}>
            SCHEDULE NEW INTAKE
          </TechButton>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs uppercase font-bold text-techgrey-500">
          RETRIEVING WORKBENCH STATUS...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active Job Card */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-techgrey-300 p-6">
              <div className="flex items-center justify-between border-b border-techgrey-200 pb-3 mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-graphite-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-electric" />
                  CURRENT ACTIVE REPAIR STATUS
                </h2>
                {activeBooking && (
                  <span className="text-xs font-mono font-bold text-electric">
                    {activeBooking.reference_code}
                  </span>
                )}
              </div>

              {activeBooking ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-offwhite-50 border border-techgrey-200 p-4">
                    <div>
                      <div className="text-xs font-bold uppercase text-graphite-900">
                        {activeBooking.device_type} • {activeBooking.device_brand} {activeBooking.device_model}
                      </div>
                      <div className="text-[11px] text-techgrey-500 uppercase mt-0.5">
                        SERVICE: {activeBooking.service?.name || 'BENCH INTAKE'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <TechBadge status={activeBooking.appointment_status} />
                      <TechBadge status={activeBooking.repair_status} />
                    </div>
                  </div>

                  <div className="text-xs text-graphite-700 uppercase bg-white border border-techgrey-200 p-3">
                    <span className="font-bold text-graphite-900">SYMPTOMS LOGGED: </span>
                    {activeBooking.problem_description}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-techgrey-600 uppercase">
                      INTAKE SCHEDULED: <strong className="text-graphite-900">{activeBooking.slot?.slot_date} ({activeBooking.slot?.start_time})</strong>
                    </div>

                    <Link to={`/portal/repairs/${activeBooking.id}`}>
                      <TechButton variant="secondary" size="sm" icon={ArrowRight}>
                        VIEW BENCH TIMELINE
                      </TechButton>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-green mx-auto" />
                  <div className="text-xs font-bold uppercase text-graphite-900">
                    NO ACTIVE REPAIRS IN WORKSHOP
                  </div>
                  <p className="text-[11px] text-techgrey-500 uppercase max-w-sm mx-auto">
                    All previous appointments have been completed. Need hardware diagnostic or maintenance?
                  </p>
                  <Link to="/portal/book">
                    <TechButton variant="outline" size="sm" icon={CalendarPlus}>
                      BOOK INTAKE WINDOW
                    </TechButton>
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-white border border-techgrey-300 p-4">
                <div className="text-2xl font-bold text-graphite-900">{bookings.length}</div>
                <div className="text-[10px] text-techgrey-500 uppercase tracking-widest mt-1">TOTAL BOOKINGS</div>
              </div>
              <div className="bg-white border border-techgrey-300 p-4">
                <div className="text-2xl font-bold text-electric">
                  {bookings.filter(b => b.appointment_status === 'CONFIRMED').length}
                </div>
                <div className="text-[10px] text-techgrey-500 uppercase tracking-widest mt-1">CONFIRMED INTAKES</div>
              </div>
              <div className="bg-white border border-techgrey-300 p-4 col-span-2 sm:col-span-1">
                <div className="text-2xl font-bold text-green">
                  {bookings.filter(b => b.repair_status === 'DELIVERED' || b.appointment_status === 'COMPLETED').length}
                </div>
                <div className="text-[10px] text-techgrey-500 uppercase tracking-widest mt-1">COMPLETED REPAIRS</div>
              </div>
            </div>
          </div>

          {/* Right Column: Notifications & Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-techgrey-300 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-techgrey-200 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-graphite-900 flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-electric" />
                  RECENT NOTIFICATIONS
                </h3>
                <Link to="/portal/notifications" className="text-[10px] font-bold text-electric hover:underline uppercase">
                  VIEW ALL
                </Link>
              </div>

              {notifications.length === 0 ? (
                <div className="text-xs text-techgrey-400 uppercase py-4 text-center">
                  NO RECENT NOTIFICATIONS
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`p-3 border text-xs uppercase space-y-1 ${
                        n.is_read ? 'bg-white border-techgrey-200 text-techgrey-600' : 'bg-electric/5 border-electric/30 text-graphite-900 font-semibold'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-techgrey-500">
                        <span className="font-bold text-electric">{n.title}</span>
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Workshop Assistance Notice */}
            <div className="bg-graphite-900 text-offwhite-100 border border-graphite-700 p-6 space-y-2">
              <div className="text-xs uppercase font-bold text-electric tracking-widest">WORKSHOP DIRECT LINE</div>
              <div className="text-sm font-bold uppercase text-white">+1 (555) 737-8491</div>
              <p className="text-[11px] text-techgrey-400 uppercase leading-relaxed">
                Need to add urgent diagnostic notes or arrange emergency delivery? Speak with the bench supervisor.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
