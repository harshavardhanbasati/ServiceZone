import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { TechBadge } from '../../components/ui/TechBadge';
import { TechDialog } from '../../components/ui/TechDialog';
import { TechSelect } from '../../components/ui/TechSelect';
import { TechInput } from '../../components/ui/TechInput';
import { Hammer, Search, Eye, Edit2, AlertCircle } from 'lucide-react';

export function AdminRepairs() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('ACTIVE');

  // Workbench update modal
  const [modalOpen, setModalOpen] = useState(false);
  const [targetBooking, setTargetBooking] = useState(null);
  const [repairStatus, setRepairStatus] = useState('IN_PROGRESS');
  const [note, setNote] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminBookings();
      setRepairs(data);
    } catch (err) {
      console.error("Failed to load repairs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleOpenUpdate = (booking) => {
    setTargetBooking(booking);
    setRepairStatus(booking.repair_status);
    setNote('');
    setQuotedPrice(booking.quoted_price ? String(booking.quoted_price) : '');
    setFinalPrice(booking.final_price ? String(booking.final_price) : '');
    setModalError(null);
    setModalOpen(true);
  };

  const handleCommitUpdate = async (e) => {
    e.preventDefault();
    if (!targetBooking) return;
    if (note.trim().length < 3) {
      setModalError("Please provide a descriptive technician bench log (minimum 3 characters).");
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      const qp = quotedPrice ? parseFloat(quotedPrice) : null;
      const fp = finalPrice ? parseFloat(finalPrice) : null;

      await api.updateRepairStatus(targetBooking.id, repairStatus, note.trim(), qp, fp);
      setModalOpen(false);
      fetchRepairs();
    } catch (err) {
      setModalError(err.message || "Failed to commit repair update.");
    } finally {
      setSaving(false);
    }
  };

  const filteredRepairs = repairs.filter((r) => {
    if (stageFilter === 'ALL') return true;
    if (stageFilter === 'ACTIVE') {
      return ['DIAGNOSING', 'WAITING_FOR_CUSTOMER_APPROVAL', 'WAITING_FOR_PARTS', 'IN_PROGRESS'].includes(r.repair_status);
    }
    if (stageFilter === 'READY') return r.repair_status === 'READY_FOR_PICKUP';
    if (stageFilter === 'DELIVERED') return r.repair_status === 'DELIVERED';
    return r.repair_status === stageFilter;
  });

  return (
    <div className="bg-white border border-techgrey-300 p-6 sm:p-8 font-quantico space-y-6">
      <div className="pb-6 border-b border-techgrey-300">
        <div className="text-xs font-bold uppercase tracking-widest text-electric">
          DIAGNOSTIC & CIRCUIT WORKBENCH
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-graphite-900 mt-1">
          ACTIVE BENCH REPAIR MANAGEMENT
        </h1>
      </div>

      {/* Stage Filter */}
      <div className="flex flex-wrap gap-2 bg-offwhite-50 border border-techgrey-200 p-3">
        {['ACTIVE', 'READY', 'DELIVERED', 'ALL'].map((st) => (
          <button
            key={st}
            onClick={() => setStageFilter(st)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border ${
              stageFilter === st
                ? 'bg-graphite-900 border-graphite-900 text-white'
                : 'bg-white border-techgrey-300 text-graphite-800 hover:border-graphite-900'
            }`}
          >
            {st} ({
              st === 'ALL'
                ? repairs.length
                : st === 'ACTIVE'
                ? repairs.filter(r => ['DIAGNOSING', 'WAITING_FOR_CUSTOMER_APPROVAL', 'WAITING_FOR_PARTS', 'IN_PROGRESS'].includes(r.repair_status)).length
                : st === 'READY'
                ? repairs.filter(r => r.repair_status === 'READY_FOR_PICKUP').length
                : repairs.filter(r => r.repair_status === 'DELIVERED').length
            })
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs uppercase font-bold text-techgrey-500">
          QUERYING BENCH WORKBENCH DATA...
        </div>
      ) : filteredRepairs.length === 0 ? (
        <div className="p-12 text-center text-xs uppercase font-bold text-techgrey-500 border border-techgrey-200 bg-offwhite-50">
          NO REPAIR JOBS IN THIS STAGE.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs uppercase border-collapse">
            <thead>
              <tr className="border-b border-techgrey-300 bg-offwhite-100 text-techgrey-600">
                <th className="py-2.5 px-3">REF CODE</th>
                <th className="py-2.5 px-3">HARDWARE UNIT</th>
                <th className="py-2.5 px-3">CURRENT REPAIR STATE</th>
                <th className="py-2.5 px-3">QUOTED / FINAL PRICE</th>
                <th className="py-2.5 px-3">LATEST UPDATE</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-techgrey-200">
              {filteredRepairs.map((r) => {
                const latestUpdate = r.repair_updates?.[0];
                return (
                  <tr key={r.id} className="hover:bg-offwhite-50">
                    <td className="py-3 px-3 font-mono font-bold text-electric">
                      {r.reference_code}
                    </td>
                    <td className="py-3 px-3 font-bold text-graphite-900">
                      {r.device_brand} {r.device_model}
                      <div className="text-[10px] text-techgrey-500 font-normal">{r.device_type}</div>
                    </td>
                    <td className="py-3 px-3">
                      <TechBadge status={r.repair_status} />
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-graphite-900">
                        {r.quoted_price ? `$${r.quoted_price.toFixed(2)}` : 'AWAITING QUOTE'}
                      </div>
                      {r.final_price && (
                        <div className="text-[10px] text-green font-bold">FINAL: ${r.final_price.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-techgrey-700">
                      {latestUpdate?.note || 'DEVICE RECEIVED IN WORKSHOP'}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <TechButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenUpdate(r)}
                        icon={Hammer}
                      >
                        LOG UPDATE
                      </TechButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* UPDATE REPAIR STATUS MODAL */}
      <TechDialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="RECORD BENCH REPAIR UPDATE"
        subtitle={`DEVICE REF: ${targetBooking?.reference_code} • ${targetBooking?.device_brand} ${targetBooking?.device_model}`}
      >
        {targetBooking && (
          <form onSubmit={handleCommitUpdate} className="space-y-4 text-xs uppercase">
            {modalError && (
              <div className="bg-crimson/10 border border-crimson p-3 text-crimson font-bold">
                {modalError}
              </div>
            )}

            <TechSelect
              label="TARGET REPAIR LIFECYCLE STAGE"
              value={repairStatus}
              onChange={(e) => setRepairStatus(e.target.value)}
              options={[
                { value: 'NOT_STARTED', label: 'NOT STARTED (IN QUEUE)' },
                { value: 'DIAGNOSING', label: 'DIAGNOSING (BENCH ELECTRICAL & THERMAL INSPECTION)' },
                { value: 'WAITING_FOR_CUSTOMER_APPROVAL', label: 'WAITING FOR CUSTOMER APPROVAL (QUOTE SENT)' },
                { value: 'WAITING_FOR_PARTS', label: 'WAITING FOR PARTS (OEM COMPONENTS ORDERED)' },
                { value: 'IN_PROGRESS', label: 'IN PROGRESS (CIRCUIT REPAIR / MICROSOLDERING)' },
                { value: 'READY_FOR_PICKUP', label: 'READY FOR PICKUP (STRESS TESTING PASSED)' },
                { value: 'DELIVERED', label: 'DELIVERED (HANDED OVER TO CLIENT)' },
              ]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TechInput
                label="QUOTED PRICE ($)"
                type="number"
                step="0.01"
                placeholder="E.G. 120.00"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
              />
              <TechInput
                label="FINAL PRICE ON COMPLETION ($)"
                type="number"
                step="0.01"
                placeholder="E.G. 120.00"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-graphite-900">
                TECHNICIAN BENCH LOG / ACTION NOTE (CUSTOMER-VISIBLE) *
              </label>
              <textarea
                required
                rows={4}
                placeholder="E.G. MOTHERBOARD POWER RAIL REBUILT UNDER MICROSCOPE. 24-HOUR STRESS LOAD TESTING PASSED WITH 0 ERRORS."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="text-xs font-quantico p-2.5 border border-techgrey-300 rounded-none uppercase outline-none focus:border-electric"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-techgrey-200">
              <TechButton variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                CANCEL
              </TechButton>
              <TechButton variant="primary" size="sm" type="submit" loading={saving} chamfer>
                COMMIT LOG & NOTIFY CUSTOMER
              </TechButton>
            </div>
          </form>
        )}
      </TechDialog>
    </div>
  );
}
