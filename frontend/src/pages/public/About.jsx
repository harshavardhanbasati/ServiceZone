import React from 'react';
import { Link } from 'react-router-dom';
import { TechButton } from '../../components/ui/TechButton';
import { Cpu, ShieldCheck, Microscope, Zap, Award, CheckSquare, Wrench } from 'lucide-react';

export function About() {
  return (
    <div className="py-12 bg-offwhite-100 min-h-screen font-quantico">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="pb-6 border-b border-techgrey-300">
          <div className="text-xs font-bold uppercase tracking-widest text-electric mb-1">
            LABORATORY OVERVIEW
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-graphite-900">
            PRECISION COMPUTER SERVICE LAB
          </h1>
          <p className="text-sm text-graphite-700 mt-2 max-w-3xl uppercase leading-relaxed">
            ServiceZone is a dedicated hardware repair and diagnostic facility engineered for high-density logic boards, consumer and commercial laptops, and mission-critical desktop workstations.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-techgrey-300 p-6 space-y-3">
            <Microscope className="w-8 h-8 text-electric" />
            <h3 className="text-base font-bold uppercase tracking-wider text-graphite-900">
              BOARD-LEVEL MICROSURGERY
            </h3>
            <p className="text-xs text-graphite-700 leading-relaxed uppercase">
              We repair motherboard power circuits, replace blown MOSFETs, and rebuild damaged traces under high-magnification stereomicroscopes rather than discarding costly mainboards.
            </p>
          </div>

          <div className="bg-white border border-techgrey-300 p-6 space-y-3">
            <Zap className="w-8 h-8 text-amber" />
            <h3 className="text-base font-bold uppercase tracking-wider text-graphite-900">
              THERMAL & ELECTRICAL DIAGNOSTICS
            </h3>
            <p className="text-xs text-graphite-700 leading-relaxed uppercase">
              Using FLIR thermal cameras and calibrated digital storage oscilloscopes, we pinpoint short circuits, voltage ripples, and cooling inefficiencies within minutes.
            </p>
          </div>

          <div className="bg-white border border-techgrey-300 p-6 space-y-3">
            <ShieldCheck className="w-8 h-8 text-green" />
            <h3 className="text-base font-bold uppercase tracking-wider text-graphite-900">
              ESD-CONTROLLED WORKBENCH
            </h3>
            <p className="text-xs text-graphite-700 leading-relaxed uppercase">
              Our workshop operates strictly within ANSI/ESD S20.20 electrostatic standards. Grounded dissipative mats, wrist straps, and ionizers protect delicate silicon from static breakdown.
            </p>
          </div>
        </div>

        {/* Workshop Specifications Breakdown */}
        <div className="bg-graphite-900 text-offwhite-100 border border-graphite-700 p-8 space-y-6">
          <div className="border-b border-graphite-800 pb-3">
            <div className="text-xs uppercase font-bold text-electric tracking-widest">FACILITY SPECIFICATIONS</div>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white mt-1">
              BENCH EQUIPMENT & PROTOCOLS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-techgrey-300 uppercase">
            <div className="border-l-2 border-electric pl-4 py-1">
              <div className="font-bold text-white text-sm">MICROSOLDERING</div>
              <div className="text-techgrey-400 mt-1">JBC Soldering Stations with micro-tweezers & hot air pencil.</div>
            </div>
            <div className="border-l-2 border-electric pl-4 py-1">
              <div className="font-bold text-white text-sm">THERMAL IMAGING</div>
              <div className="text-techgrey-400 mt-1">High-resolution FLIR thermal camera for component short detection.</div>
            </div>
            <div className="border-l-2 border-electric pl-4 py-1">
              <div className="font-bold text-white text-sm">PROGRAMMING</div>
              <div className="text-techgrey-400 mt-1">Direct SPI firmware programmer for corrupted BIOS & EC recovery.</div>
            </div>
            <div className="border-l-2 border-electric pl-4 py-1">
              <div className="font-bold text-white text-sm">STRESS LAB</div>
              <div className="text-techgrey-400 mt-1">OCCT, FurMark, MemTest86 24-hour certified burn-in validation.</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white border border-techgrey-300 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold uppercase tracking-wider text-graphite-900">
              EXPERIENCING HARDWARE INSTABILITY OR LIQUID DAMAGE?
            </h3>
            <p className="text-xs text-graphite-600 uppercase">
              Schedule a dedicated 30-minute intake window to check in your device at Workshop Bay 4.
            </p>
          </div>
          <Link to="/portal/book">
            <TechButton variant="primary" size="lg" chamfer icon={Wrench}>
              SCHEDULE INTAKE
            </TechButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
