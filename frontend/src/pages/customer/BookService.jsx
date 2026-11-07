import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { TechInput } from '../../components/ui/TechInput';
import { TechSelect } from '../../components/ui/TechSelect';
import { 
  Check, ArrowRight, ArrowLeft, Calendar, Clock, Wrench, 
  Cpu, CheckCircle2, AlertCircle 
} from 'lucide-react';

export function BookService() {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') || '';
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Form selections
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedService);
  const [deviceType, setDeviceType] = useState('LAPTOP');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Date & Slot
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Load services
  useEffect(() => {
    async function loadServices() {
      try {
        const data = await api.getServices();
        setServices(data);
        if (preselectedService && data.some(s => s.id === preselectedService)) {
          setSelectedServiceId(preselectedService);
        } else if (data.length > 0 && !selectedServiceId) {
          setSelectedServiceId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load services", err);
      } finally {
        setLoadingServices(false);
      }
    }
    loadServices();
  }, [preselectedService]);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // If tomorrow is Sunday, advance to Monday
    if (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;
    async function fetchSlots() {
      setLoadingSlots(true);
      try {
        const slots = await api.getAvailableSlots(`?date=${selectedDate}`);
        setAvailableSlots(slots);
        const firstAvailable = slots.find(s => !s.is_reserved && s.is_active);
        setSelectedSlotId(firstAvailable ? firstAvailable.id : '');
      } catch (err) {
        console.error("Failed to fetch slots", err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedDate]);

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedSlot = availableSlots.find(s => s.id === selectedSlotId);

  const handleNextStep = () => {
    if (step === 1 && !selectedServiceId) return;
    if (step === 2) {
      if (!brand.trim() || !model.trim() || problemDescription.trim().length < 10) {
        setSubmitError("Please fill in Brand, Model, and a Problem Description of at least 10 characters.");
        return;
      }
      setSubmitError(null);
    }
    if (step === 3 && !selectedSlotId) {
      setSubmitError("Please select an available intake time slot.");
      return;
    }
    setSubmitError(null);
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setSubmitError(null);
    setStep(step - 1);
  };

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        service_id: selectedServiceId,
        slot_id: selectedSlotId,
        device_type: deviceType,
        device_brand: brand.trim(),
        device_model: model.trim(),
        problem_description: problemDescription.trim(),
        additional_notes: additionalNotes.trim() || null,
      };

      const result = await api.createBooking(payload);
      setCreatedBooking(result);
      setStep(5); // Success step
    } catch (err) {
      setSubmitError(err.message || "Failed to reserve slot. It may have just been claimed by another customer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-techgrey-300 p-6 sm:p-8 font-quantico space-y-8">
      {/* Wizard Step Indicator */}
      <div className="border-b border-techgrey-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-electric">
              RESERVATION WIZARD // STAGE 0{step} OF 04
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-graphite-900 mt-1">
              SCHEDULE BENCH INTAKE
            </h1>
          </div>
          <div className="text-xs text-techgrey-500 uppercase hidden sm:block">
            100% SECURE • NO ONLINE PAYMENT REQUIRED
          </div>
        </div>

        {/* Step bars */}
        {step <= 4 && (
          <div className="grid grid-cols-4 gap-2 mt-6">
            {['01 SERVICE', '02 DEVICE', '03 SCHEDULE', '04 CONFIRM'].map((label, idx) => (
              <div
                key={label}
                className={`h-1.5 transition-colors ${
                  step > idx + 1
                    ? 'bg-green'
                    : step === idx + 1
                    ? 'bg-electric'
                    : 'bg-techgrey-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {submitError && (
        <div className="bg-crimson/10 border border-crimson p-4 text-xs text-crimson font-bold uppercase flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* STEP 1: SERVICE SELECTION */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-xs font-bold uppercase tracking-wider text-graphite-900">
            CHOOSE THE PRIMARY WORKBENCH PROTOCOL:
          </div>

          {loadingServices ? (
            <div className="p-12 text-center text-xs uppercase text-techgrey-500">
              LOADING REPAIR PROTOCOLS...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  onClick={() => setSelectedServiceId(svc.id)}
                  className={`p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedServiceId === svc.id
                      ? 'border-2 border-electric bg-electric/5'
                      : 'border-techgrey-300 hover:border-graphite-800 bg-offwhite-50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-techgrey-500 font-mono">
                      <span className="uppercase text-electric font-bold">{svc.category}</span>
                      <span>~{svc.estimated_duration_minutes} MIN</span>
                    </div>
                    <h3 className="text-sm font-bold uppercase text-graphite-900">
                      {svc.name}
                    </h3>
                    <p className="text-xs text-graphite-700 uppercase leading-relaxed">
                      {svc.summary}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-techgrey-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-graphite-900">
                      {svc.display_price ? `$${svc.display_price.toFixed(2)}` : 'UPON DIAGNOSIS'}
                    </span>
                    <span className="text-[10px] text-techgrey-500 uppercase">
                      {selectedServiceId === svc.id ? 'SELECTED' : 'CLICK TO SELECT'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-techgrey-200">
            <TechButton
              variant="primary"
              size="md"
              onClick={handleNextStep}
              disabled={!selectedServiceId}
              chamfer
              icon={ArrowRight}
            >
              PROCEED TO DEVICE SPECS
            </TechButton>
          </div>
        </div>
      )}

      {/* STEP 2: DEVICE DETAILS */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-xs font-bold uppercase tracking-wider text-graphite-900">
            SPECIFY HARDWARE IDENTIFIERS & PROBLEM SYMPTOMS:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TechSelect
              label="DEVICE CATEGORY"
              required
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              options={[
                { value: 'LAPTOP', label: 'LAPTOP (MACBOOK / WINDOWS / LINUX)' },
                { value: 'DESKTOP', label: 'DESKTOP PC / WORKSTATION' },
                { value: 'AIO', label: 'ALL-IN-ONE (IMAC / AIO)' },
                { value: 'CUSTOM_PC', label: 'CUSTOM BUILT RIG / GAMING TOWER' },
                { value: 'OTHER', label: 'OTHER HARDWARE MODULE' },
              ]}
            />

            <TechInput
              label="MANUFACTURER / BRAND"
              required
              placeholder="E.G. FRAMEWORK, DELL, APPLE, ASUS"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />

            <TechInput
              label="EXACT MODEL OR CHASSIS"
              required
              placeholder="E.G. LAPTOP 16, XPS 15 9520, MACBOOK PRO M2"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-graphite-900 flex justify-between">
              <span>PROBLEM DESCRIPTION (MIN 10 CHARACTERS) *</span>
              <span className="text-techgrey-500 font-normal">{problemDescription.length} / 2000</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="DESCRIBE EXACT SYMPTOMS, WHEN THE FAULT OCCURS, PREVIOUS LIQUID EXPOSURE, OR ANY ATTEMPTED FIXES..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="text-xs font-quantico p-3 border border-techgrey-300 rounded-none uppercase outline-none focus:border-electric"
            />
          </div>

          <TechInput
            label="ADDITIONAL BENCH NOTES (OPTIONAL)"
            placeholder="E.G. CHARGER INCLUDED, NO BITLOCKER PASSWORD, DATA BACKED UP"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
          />

          <div className="flex items-center justify-between pt-4 border-t border-techgrey-200">
            <TechButton variant="outline" size="md" onClick={handlePrevStep} icon={ArrowLeft}>
              BACK
            </TechButton>
            <TechButton variant="primary" size="md" onClick={handleNextStep} chamfer icon={ArrowRight}>
              PROCEED TO SCHEDULING
            </TechButton>
          </div>
        </div>
      )}

      {/* STEP 3: SCHEDULE & SLOT */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-xs font-bold uppercase tracking-wider text-graphite-900">
            SELECT INTAKE APPOINTMENT DATE & 30-MINUTE TIME WINDOW:
          </div>

          {/* Date Picker */}
          <div className="max-w-xs">
            <TechInput
              label="DESIRED DROP-OFF DATE"
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Slots Grid */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-graphite-900 block mb-3">
              AVAILABLE 30-MINUTE INTAKE SLOTS FOR {selectedDate}:
            </label>

            {loadingSlots ? (
              <div className="p-8 text-center text-xs uppercase text-techgrey-500">
                CHECKING WORKSHOP INTAKE AVAILABILITY...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="bg-offwhite-50 border border-techgrey-300 p-8 text-center space-y-2">
                <div className="text-xs font-bold uppercase text-graphite-900">NO INTAKE SLOTS SCHEDULED FOR THIS DATE</div>
                <p className="text-[11px] text-techgrey-500 uppercase">
                  Please select an alternative weekday or contact our bench engineer.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {availableSlots.map((slot) => {
                  const isReserved = slot.is_reserved;
                  const isSelected = selectedSlotId === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isReserved || !slot.is_active}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-3 border text-center transition-all ${
                        isReserved
                          ? 'border-techgrey-200 bg-techgrey-100 text-techgrey-400 cursor-not-allowed line-through'
                          : isSelected
                          ? 'border-2 border-electric bg-electric text-white font-bold'
                          : 'border-techgrey-300 bg-white text-graphite-900 hover:border-graphite-900'
                      }`}
                    >
                      <div className="text-xs font-mono">{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</div>
                      <div className="text-[9px] uppercase tracking-wider mt-1">
                        {isReserved ? 'RESERVED' : isSelected ? 'SELECTED' : 'AVAILABLE'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-techgrey-200">
            <TechButton variant="outline" size="md" onClick={handlePrevStep} icon={ArrowLeft}>
              BACK
            </TechButton>
            <TechButton
              variant="primary"
              size="md"
              onClick={handleNextStep}
              disabled={!selectedSlotId}
              chamfer
              icon={ArrowRight}
            >
              REVIEW COMPLETE SUMMARY
            </TechButton>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-xs font-bold uppercase tracking-wider text-graphite-900">
            REVIEW BENCH INTAKE SPECIFICATIONS BEFORE COMMITTING:
          </div>

          <div className="border border-graphite-800 bg-graphite-900 text-offwhite-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-graphite-700 pb-3">
              <span className="text-xs uppercase font-bold text-electric">SERVICE SPECIFICATION</span>
              <span className="text-sm font-bold uppercase text-white">{selectedService?.name}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-techgrey-300 uppercase border-b border-graphite-700 pb-4">
              <div>
                <span className="text-techgrey-400">HARDWARE CATEGORY: </span>
                <strong className="text-white">{deviceType}</strong>
              </div>
              <div>
                <span className="text-techgrey-400">MAKE & MODEL: </span>
                <strong className="text-white">{brand} {model}</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-techgrey-400">LOGGED SYMPTOMS: </span>
                <p className="text-white mt-1 bg-graphite-850 p-2 border border-graphite-700">
                  {problemDescription}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-techgrey-300 uppercase">
              <div>
                <span className="text-techgrey-400">INTAKE DATE: </span>
                <strong className="text-white">{selectedSlot?.slot_date}</strong>
              </div>
              <div>
                <span className="text-techgrey-400">APPOINTMENT WINDOW: </span>
                <strong className="text-electric">{selectedSlot?.start_time} - {selectedSlot?.end_time}</strong>
              </div>
              <div>
                <span className="text-techgrey-400">WORKSHOP LOCATION: </span>
                <strong className="text-white">BAY 4 (ON-SITE)</strong>
              </div>
            </div>
          </div>

          <div className="bg-offwhite-50 border border-techgrey-300 p-4 text-xs text-graphite-700 uppercase space-y-1">
            <div className="font-bold text-graphite-900">WORKBENCH INTAKE TERMS:</div>
            <p>
              • Your 30-minute intake slot is exclusively reserved upon submission.
            </p>
            <p>
              • No online payment is processed today. Quoted charges apply only after physical diagnosis and your explicit authorization.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-techgrey-200">
            <TechButton variant="outline" size="md" onClick={handlePrevStep} icon={ArrowLeft}>
              BACK
            </TechButton>
            <TechButton
              variant="primary"
              size="lg"
              onClick={handleSubmitBooking}
              loading={submitting}
              chamfer
              icon={Check}
            >
              CONFIRM & SECURE INTAKE SLOT
            </TechButton>
          </div>
        </div>
      )}

      {/* STEP 5: SUCCESS CONFIRMATION */}
      {step === 5 && createdBooking && (
        <div className="py-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-lg">
            ✓
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-electric">
              SLOT RESERVATION CONFIRMED
            </div>
            <h2 className="text-3xl font-bold uppercase tracking-tight text-graphite-900">
              INTAKE APPOINTMENT REGISTERED
            </h2>
            <p className="text-xs text-graphite-600 uppercase max-w-md mx-auto">
              Your device intake reservation has been successfully booked into our bench management system.
            </p>
          </div>

          {/* Reference Card */}
          <div className="max-w-md mx-auto bg-graphite-900 text-offwhite-100 p-6 border-2 border-graphite-700 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-graphite-700 pb-2">
              <span className="text-[10px] text-techgrey-400 uppercase">PUBLIC TRACKING REFERENCE</span>
              <span className="text-xl font-bold text-electric font-mono">{createdBooking.reference_code}</span>
            </div>
            <div className="text-xs text-techgrey-300 space-y-1 uppercase">
              <div>DEVICE: <strong className="text-white">{createdBooking.device_brand} {createdBooking.device_model}</strong></div>
              <div>DATE: <strong className="text-white">{selectedDate}</strong></div>
              <div>TIME: <strong className="text-white">{selectedSlot?.start_time} - {selectedSlot?.end_time}</strong></div>
              <div>LOCATION: <strong className="text-white">104 Tech Blvd, Bay 4</strong></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/portal/appointments">
              <TechButton variant="secondary" size="md">
                VIEW MY APPOINTMENTS
              </TechButton>
            </Link>
            <Link to={`/track?ref=${createdBooking.reference_code}`}>
              <TechButton variant="outline" size="md">
                TRACK IN PUBLIC TELEMETRY
              </TechButton>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
