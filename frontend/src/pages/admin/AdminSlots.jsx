import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { TechDialog } from '../../components/ui/TechDialog';
import { TechInput } from '../../components/ui/TechInput';
import { Calendar, Plus, Clock, Power, CheckCircle2 } from 'lucide-react';

export function AdminSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  // Batch generator modal
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchData, setBatchData] = useState({
    start_date: '',
    end_date: '',
    start_time: '09:00',
    end_time: '18:00',
    slot_duration_minutes: 30,
  });
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminSlots(filterDate);
      setSlots(data);
    } catch (err) {
      console.error("Failed to load slots", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [filterDate]);

  const handleOpenBatch = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const fmt = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    setBatchData({
      start_date: fmt(today),
      end_date: fmt(nextWeek),
      start_time: '09:00',
      end_time: '17:30',
      slot_duration_minutes: 30,
    });
    setFeedback(null);
    setBatchModalOpen(true);
  };

  const handleBatchGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setFeedback(null);

    try {
      const payload = {
        start_date: batchData.start_date,
        end_date: batchData.end_date,
        start_time: `${batchData.start_time}:00`,
        end_time: `${batchData.end_time}:00`,
        slot_duration_minutes: parseInt(batchData.slot_duration_minutes, 10),
      };

      const res = await api.batchCreateSlots(payload);
      setFeedback({ type: 'success', msg: res.message || 'Slots generated successfully.' });
      setBatchModalOpen(false);
      fetchSlots();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Failed to generate slots.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleSlot = async (slot) => {
    try {
      await api.toggleSlot(slot.id, !slot.is_active);
      fetchSlots();
    } catch (err) {
      alert(err.message || 'Failed to toggle slot state.');
    }
  };

  return (
    <div className="bg-white border border-techgrey-300 p-6 sm:p-8 font-quantico space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-techgrey-300 gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-electric">
            SCHEDULE & AVAILABILITY ENGINE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-graphite-900 mt-1">
            INTAKE APPOINTMENT SLOTS
          </h1>
        </div>

        <TechButton variant="primary" size="sm" onClick={handleOpenBatch} chamfer icon={Plus}>
          BATCH GENERATE SLOTS
        </TechButton>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-offwhite-50 border border-techgrey-200 p-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-graphite-900">
            FILTER DATE:
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="text-xs font-quantico px-3 py-1.5 border border-techgrey-300 rounded-none uppercase outline-none focus:border-electric"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-xs text-crimson font-bold uppercase hover:underline"
            >
              CLEAR FILTER
            </button>
          )}
        </div>

        <div className="text-xs text-techgrey-500 uppercase font-bold">
          SHOWING {slots.length} SLOTS
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs uppercase font-bold text-techgrey-500">
          QUERYING SLOT REGISTRY...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs uppercase border-collapse">
            <thead>
              <tr className="border-b border-techgrey-300 bg-offwhite-100 text-techgrey-600">
                <th className="py-2.5 px-3">DATE</th>
                <th className="py-2.5 px-3">INTAKE WINDOW</th>
                <th className="py-2.5 px-3">OCCUPANCY</th>
                <th className="py-2.5 px-3">SLOT STATE</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-techgrey-200">
              {slots.map((s) => (
                <tr key={s.id} className="hover:bg-offwhite-50">
                  <td className="py-3 px-3 font-bold text-graphite-900">{s.slot_date}</td>
                  <td className="py-3 px-3 font-mono text-electric">
                    {s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold border ${
                      s.is_reserved ? 'bg-amber/10 border-amber text-amber' : 'bg-green/10 border-green text-green'
                    }`}>
                      {s.is_reserved ? 'RESERVED (OCCUPIED)' : 'AVAILABLE (VACANT)'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold border ${
                      s.is_active ? 'bg-white border-techgrey-300 text-graphite-900' : 'bg-techgrey-200 border-techgrey-400 text-techgrey-500 line-through'
                    }`}>
                      {s.is_active ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleToggleSlot(s)}
                      className="px-2.5 py-1 border border-techgrey-300 hover:border-graphite-900 text-[10px] font-bold uppercase transition-colors"
                    >
                      {s.is_active ? 'DISABLE' : 'ENABLE'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* BATCH GENERATOR MODAL */}
      <TechDialog
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        title="BATCH GENERATE INTAKE SLOTS"
        subtitle="AUTOMATICALLY CREATE 30-MINUTE INTERVALS ACROSS DATE RANGE"
      >
        <form onSubmit={handleBatchGenerate} className="space-y-4 text-xs uppercase">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TechInput
              label="START DATE"
              type="date"
              required
              value={batchData.start_date}
              onChange={(e) => setBatchData({ ...batchData, start_date: e.target.value })}
            />
            <TechInput
              label="END DATE"
              type="date"
              required
              value={batchData.end_date}
              onChange={(e) => setBatchData({ ...batchData, end_date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TechInput
              label="DAILY OPEN TIME"
              type="time"
              required
              value={batchData.start_time}
              onChange={(e) => setBatchData({ ...batchData, start_time: e.target.value })}
            />
            <TechInput
              label="DAILY CLOSE TIME"
              type="time"
              required
              value={batchData.end_time}
              onChange={(e) => setBatchData({ ...batchData, end_time: e.target.value })}
            />
            <TechInput
              label="SLOT DURATION (MIN)"
              type="number"
              required
              value={batchData.slot_duration_minutes}
              onChange={(e) => setBatchData({ ...batchData, slot_duration_minutes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-techgrey-200">
            <TechButton variant="outline" size="sm" onClick={() => setBatchModalOpen(false)}>
              CANCEL
            </TechButton>
            <TechButton variant="primary" size="sm" type="submit" loading={generating} chamfer>
              GENERATE SCHEDULE SLOTS
            </TechButton>
          </div>
        </form>
      </TechDialog>
    </div>
  );
}
