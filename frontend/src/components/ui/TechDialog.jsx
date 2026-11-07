import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function TechDialog({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className={`w-full ${maxWidth} bg-white border-2 border-graphite-900 shadow-2xl relative flex flex-col rounded-none max-h-[90vh] overflow-hidden`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-techgrey-300 bg-offwhite-100">
          <div>
            <div className="text-xs uppercase tracking-widest text-electric font-bold font-quantico">SYS // PROMPT</div>
            <h3 className="text-lg font-bold font-quantico uppercase tracking-wider text-graphite-900">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-techgrey-500 font-quantico">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-techgrey-500 hover:text-graphite-900 hover:bg-techgrey-200 border border-transparent hover:border-techgrey-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-quantico">
          {children}
        </div>
      </div>
    </div>
  );
}
