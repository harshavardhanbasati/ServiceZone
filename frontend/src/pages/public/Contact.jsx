import React, { useState } from 'react';
import { TechButton } from '../../components/ui/TechButton';
import { TechInput } from '../../components/ui/TechInput';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    device: '',
    inquiry: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 bg-offwhite-100 min-h-screen font-quantico">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-techgrey-300">
          <div className="text-xs font-bold uppercase tracking-widest text-electric mb-1">
            WORKSHOP INQUIRIES
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-graphite-900">
            CONTACT & LOCATION
          </h1>
          <p className="text-sm text-graphite-700 mt-2 max-w-2xl uppercase">
            Have questions regarding component availability, custom build specifications, or urgent bench repairs? Reach out to our technicians.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Info & Location details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-graphite-900 text-offwhite-100 border border-graphite-700 p-6 space-y-6">
              <div className="border-b border-graphite-800 pb-3">
                <div className="text-xs uppercase font-bold text-electric tracking-widest">FACILITY HEADQUARTERS</div>
                <h3 className="text-lg font-bold uppercase tracking-wider text-white mt-1">
                  WORKSHOP BAY 4
                </h3>
              </div>

              <div className="space-y-4 text-xs text-techgrey-300 uppercase">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-electric flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">PHYSICAL ADDRESS:</div>
                    <div className="text-techgrey-400 mt-0.5">104 Tech Boulevard, Suite B, Workshop Bay 4</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-electric flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">DIRECT BENCH HOTLINE:</div>
                    <div className="text-techgrey-400 mt-0.5">+1 (555) 737-8491</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-electric flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">ELECTRONIC DISPATCH:</div>
                    <div className="text-techgrey-400 mt-0.5">intake@servicezone.tech</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-electric flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">OPERATING HOURS:</div>
                    <div className="text-techgrey-400 mt-0.5">Monday – Saturday: 09:00 – 18:00 (Sunday Closed)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-techgrey-300 p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-graphite-900 mb-2">
                DROP-OFF PROTOCOL NOTICE
              </h4>
              <p className="text-xs text-graphite-600 uppercase leading-relaxed">
                To guarantee zero waiting times and dedicated one-on-one technician consultation, we encourage scheduling a 30-minute intake window prior to visiting the workshop.
              </p>
            </div>
          </div>

          {/* Right: Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-techgrey-300 p-8">
              <h2 className="text-xl font-bold uppercase tracking-wider text-graphite-900 mb-6 border-b border-techgrey-200 pb-3">
                DISPATCH BENCH INQUIRY
              </h2>

              {submitted ? (
                <div className="bg-green/10 border border-green p-6 text-center space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-green mx-auto" />
                  <h3 className="text-base font-bold uppercase text-graphite-900">INQUIRY TRANSMITTED</h3>
                  <p className="text-xs text-graphite-700 uppercase">
                    Your message has been routed to our duty bench engineer. We will respond via phone or email during operating hours.
                  </p>
                  <TechButton variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    SEND ANOTHER MESSAGE
                  </TechButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TechInput
                      label="YOUR FULL NAME"
                      required
                      placeholder="E.G. JOHN DOE"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <TechInput
                      label="EMAIL ADDRESS"
                      type="email"
                      required
                      placeholder="JOHN@EXAMPLE.COM"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TechInput
                      label="PHONE NUMBER"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <TechInput
                      label="DEVICE MAKE & MODEL"
                      placeholder="E.G. THINKPAD X1 CARBON"
                      value={formData.device}
                      onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-graphite-900">
                      SYMPTOM / SPECIFICATION DETAILS *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="DESCRIBE YOUR HARDWARE ISSUE, ERROR CODES, OR UPGRADE REQUIREMENTS..."
                      value={formData.inquiry}
                      onChange={(e) => setFormData({ ...formData, inquiry: e.target.value })}
                      className="text-xs font-quantico p-3 border border-techgrey-300 rounded-none uppercase outline-none focus:border-electric"
                    />
                  </div>

                  <TechButton type="submit" variant="primary" size="md" chamfer icon={Send}>
                    TRANSMIT INQUIRY
                  </TechButton>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
