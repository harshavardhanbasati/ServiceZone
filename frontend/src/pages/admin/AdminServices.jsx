import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { TechDialog } from '../../components/ui/TechDialog';
import { TechInput } from '../../components/ui/TechInput';
import { TechSelect } from '../../components/ui/TechSelect';
import { Wrench, Plus, Edit2, Power, CheckCircle2 } from 'lucide-react';

export function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hardware Repair',
    pricing_mode: 'STARTING_AT',
    display_price: '',
    estimated_duration_minutes: '60',
    summary: '',
    description: '',
    image_path: '/assets/services/hardware-repair.webp',
    display_order: '0',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminServices();
      setServices(data);
    } catch (err) {
      console.error("Failed to load admin services", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'Hardware Repair',
      pricing_mode: 'STARTING_AT',
      display_price: '79.00',
      estimated_duration_minutes: '60',
      summary: '',
      description: '',
      image_path: '/assets/services/hardware-repair.webp',
      display_order: '0',
      is_active: true,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setFormData({
      name: svc.name,
      category: svc.category,
      pricing_mode: svc.pricing_mode,
      display_price: svc.display_price ? String(svc.display_price) : '',
      estimated_duration_minutes: String(svc.estimated_duration_minutes),
      summary: svc.summary,
      description: svc.description,
      image_path: svc.image_path,
      display_order: String(svc.display_order),
      is_active: svc.is_active,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleToggleActive = async (svc) => {
    try {
      await api.updateAdminService(svc.id, { is_active: !svc.is_active });
      fetchServices();
    } catch (err) {
      alert(err.message || 'Failed to toggle service state');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      pricing_mode: formData.pricing_mode,
      display_price: formData.display_price ? parseFloat(formData.display_price) : null,
      estimated_duration_minutes: parseInt(formData.estimated_duration_minutes, 10) || 60,
      summary: formData.summary.trim(),
      description: formData.description.trim(),
      image_path: formData.image_path,
      display_order: parseInt(formData.display_order, 10) || 0,
      is_active: formData.is_active,
    };

    try {
      if (editingService) {
        await api.updateAdminService(editingService.id, payload);
      } else {
        await api.createAdminService(payload);
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      setFormError(err.message || 'Failed to save service specification');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-techgrey-300 p-6 sm:p-8 font-quantico space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-techgrey-300 gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-electric">
            WORKBENCH CATALOG ENGINE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-graphite-900 mt-1">
            SERVICE SPECIFICATIONS MANAGEMENT
          </h1>
        </div>

        <TechButton variant="primary" size="sm" onClick={handleOpenAdd} chamfer icon={Plus}>
          ADD SERVICE
        </TechButton>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs uppercase font-bold text-techgrey-500">
          LOADING SERVICE REPOSITORIES...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs uppercase border-collapse">
            <thead>
              <tr className="border-b border-techgrey-300 bg-offwhite-100 text-techgrey-600">
                <th className="py-2.5 px-3">NAME & SPEC</th>
                <th className="py-2.5 px-3">CATEGORY</th>
                <th className="py-2.5 px-3">BENCH PRICING</th>
                <th className="py-2.5 px-3">EST. DURATION</th>
                <th className="py-2.5 px-3">STATE</th>
                <th className="py-2.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-techgrey-200">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-offwhite-50">
                  <td className="py-3 px-3">
                    <div className="font-bold text-graphite-900">{svc.name}</div>
                    <div className="text-[10px] text-techgrey-500 font-mono">{svc.slug}</div>
                  </td>
                  <td className="py-3 px-3 text-techgrey-700">{svc.category}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-graphite-900">
                      {svc.display_price ? `$${svc.display_price.toFixed(2)}` : 'N/A'}
                    </span>
                    <div className="text-[9px] text-techgrey-500">{svc.pricing_mode}</div>
                  </td>
                  <td className="py-3 px-3 text-techgrey-700">~{svc.estimated_duration_minutes} MIN</td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold border ${
                      svc.is_active ? 'bg-green/10 border-green text-green' : 'bg-techgrey-200 border-techgrey-400 text-techgrey-500'
                    }`}>
                      {svc.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(svc)}
                      className="p-1.5 border border-techgrey-300 hover:border-graphite-900 text-graphite-800"
                      title="Edit Service"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(svc)}
                      className={`p-1.5 border ${
                        svc.is_active 
                          ? 'border-techgrey-300 hover:border-crimson text-techgrey-600 hover:text-crimson'
                          : 'border-green text-green'
                      }`}
                      title={svc.is_active ? 'Deactivate Service' : 'Activate Service'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SERVICE MODAL */}
      <TechDialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'EDIT SERVICE SPECIFICATION' : 'CREATE SERVICE SPECIFICATION'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs uppercase">
          {formError && (
            <div className="bg-crimson/10 border border-crimson p-3 text-crimson font-bold">
              {formError}
            </div>
          )}

          <TechInput
            label="SERVICE NAME"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TechSelect
              label="CATEGORY"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: 'Hardware Repair', label: 'HARDWARE REPAIR' },
                { value: 'Software Services', label: 'SOFTWARE SERVICES' },
                { value: 'Virus & Malware Removal', label: 'VIRUS & MALWARE REMOVAL' },
                { value: 'Computer Maintenance', label: 'COMPUTER MAINTENANCE' },
                { value: 'Data Recovery', label: 'DATA RECOVERY' },
                { value: 'PC Assembly & Upgrades', label: 'PC ASSEMBLY & UPGRADES' },
              ]}
            />

            <TechSelect
              label="PRICING MODE"
              value={formData.pricing_mode}
              onChange={(e) => setFormData({ ...formData, pricing_mode: e.target.value })}
              options={[
                { value: 'STARTING_AT', label: 'STARTING AT (SUBJECT TO BENCH)' },
                { value: 'FIXED', label: 'FIXED FLAT RATE' },
                { value: 'QUOTE_ONLY', label: 'CUSTOM QUOTATION ONLY' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TechInput
              label="DISPLAY PRICE ($)"
              type="number"
              step="0.01"
              placeholder="E.G. 79.00"
              value={formData.display_price}
              onChange={(e) => setFormData({ ...formData, display_price: e.target.value })}
            />

            <TechInput
              label="ESTIMATED BENCH TIME (MINUTES)"
              type="number"
              required
              value={formData.estimated_duration_minutes}
              onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-graphite-900">
              SHORT SUMMARY (DISPLAYED IN CARDS) *
            </label>
            <textarea
              required
              rows={2}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="text-xs font-quantico p-2.5 border border-techgrey-300 rounded-none uppercase outline-none focus:border-electric"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-graphite-900">
              PROCEDURAL DESCRIPTION (FULL SPEC SHEET) *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="text-xs font-quantico p-2.5 border border-techgrey-300 rounded-none uppercase outline-none focus:border-electric"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-techgrey-200">
            <TechButton variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              CANCEL
            </TechButton>
            <TechButton variant="primary" size="sm" type="submit" loading={saving} chamfer>
              SAVE SPECIFICATION
            </TechButton>
          </div>
        </form>
      </TechDialog>
    </div>
  );
}
