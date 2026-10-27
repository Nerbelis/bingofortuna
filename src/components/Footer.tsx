import React, { useState } from 'react';
import { TermsModal } from './legal/TermsModal';
import { PrivacyModal } from './legal/PrivacyModal';
import { ResponsibleGamingModal } from './legal/ResponsibleGaminModal';

export const Footer: React.FC = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showResponsible, setShowResponsible] = useState(false);

  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>Bingo Fortuna - Plataforma de Bingo Automatizado en Línea</span>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>Soporte Binance Pay & Pago Móvil</span>
          <span>•</span>
          <button 
            onClick={() => setShowTerms(true)} 
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Términos y Condiciones
          </button>
          <span>•</span>
          <button 
            onClick={() => setShowPrivacy(true)} 
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Política de Privacidad
          </button>
          <span>•</span>
          <button 
            onClick={() => setShowResponsible(true)} 
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Juego Responsable
          </button>
        </div>
      </div>

      {/* Ventanas modales legales integradas */}
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <ResponsibleGamingModal isOpen={showResponsible} onClose={() => setShowResponsible(false)} />
    </footer>
  );
};