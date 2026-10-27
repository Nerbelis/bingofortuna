import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  CheckCircle2,
  Copy,
  AlertCircle,
  ExternalLink,
  QrCode,
  ShieldCheck,
  RefreshCw,
  Coins,
  Building2,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { PaymentMethod, Transaction, UserWallet } from '../types/bingo';
const VENEZUELAN_BANKS = [
  { code: '0102', name: '0102 - Banco de Venezuela' },
  { code: '0104', name: '0104 - Venezolano de Crédito' },
  { code: '0105', name: '0105 - Banco Mercantil' },
  { code: '0108', name: '0108 - Banco Provincial' },
  { code: '0114', name: '0114 - Bancaribe' },
  { code: '0115', name: '0115 - Banco Exterior' },
  { code: '0128', name: '0128 - Banco Caroní' },
  { code: '0134', name: '0134 - Banesco' },
  { code: '0137', name: '0137 - Banco Sofitasa' },
  { code: '0138', name: '0138 - Banco Plaza' },
  { code: '0151', name: '0151 - BNC Banco Nacional de Crédito' },
  { code: '0156', name: '0156 - 100% Banco' },
  { code: '0157', name: '0157 - DelSur' },
  { code: '0163', name: '0163 - Banco del Tesoro' },
  { code: '0168', name: '0168 - Bancrecer' },
  { code: '0169', name: '0169 - Mi Banco' },
  { code: '0171', name: '0171 - Banco Activo' },
  { code: '0172', name: '0172 - Bancamiga' },
  { code: '0174', name: '0174 - Banplus' },
  { code: '0175', name: '0175 - Bicentenario' },
  { code: '0177', name: '0177 - BANFANB' },
  { code: '0191', name: '0191 - BNC (antes BOD)' },
];

interface CashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: UserWallet;
  transactions?: Transaction[];
  onAddTransaction?: (tx: Transaction) => void;
  onUpdateBalance?: (amountUsdt: number) => void;
}

export const CashierModal: React.FC<CashierModalProps> = ({
  isOpen,
  onClose,
  wallet,
  transactions = [],
  onAddTransaction,
  onUpdateBalance,
}) => {
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW' | 'HISTORY'>('DEPOSIT');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PAGOMOVIL');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Estados de Depósito
  const [depositAmountUsdt, setDepositAmountUsdt] = useState<string>('5');
  const [depositBinanceHash, setDepositBinanceHash] = useState<string>('');
  const [depositPagoMovilBank, setDepositPagoMovilBank] = useState<string>('0102');
  const [depositPagoMovilPhone, setDepositPagoMovilPhone] = useState<string>('0414-1234567');
  const [depositPagoMovilRef, setDepositPagoMovilRef] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados de Retiro
  const [withdrawAmountUsdt, setWithdrawAmountUsdt] = useState<string>('10');
  const [withdrawBinanceId, setWithdrawBinanceId] = useState<string>('');
  const [withdrawBank, setWithdrawBank] = useState<string>('0134');
  const [withdrawPhone, setWithdrawPhone] = useState<string>('');
  const [withdrawCi, setWithdrawCi] = useState<string>('');

  if (!isOpen) return null;

  // --- FUNCIÓN DE DEPÓSITO ---
  const handleDepositSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const numericAmount = parseFloat(String(depositAmountUsdt || '0'));
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setErrorMessage('Ingresa un monto válido para recargar.');
        setIsProcessing(false);
        return;
      }

      const rate = (wallet as any)?.exchangeRate || 40;
      const vesAmount = numericAmount * rate;
      const txId = 'TX-' + String(Date.now()).slice(-6);
      const refCode = String(paymentMethod === 'BINANCE' ? (depositBinanceHash || 'N/A') : (depositPagoMovilRef || 'N/A'));

      const newTx: any = {
        id: txId,
        type: 'DEPOSIT',
        amountUsdt: numericAmount,
        amountVes: vesAmount,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        reference: refCode
      };

      const response = await fetch('http://localhost:3001/api/report-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depositId: txId,
          userId: 'Nerbelis Valdeblanques',
          amountUsdt: numericAmount,
          amountVes: vesAmount,
          bank: String(paymentMethod || 'PAGOMOVIL'),
          reference: refCode
        })
      });

      const serverResult = await response.json();
      console.log('Respuesta del servidor:', serverResult);

      if (onAddTransaction) (onAddTransaction as any)(newTx);
      if (onUpdateBalance) (onUpdateBalance as any)(numericAmount);

      setSuccessMessage('¡Pago procesado y notificado con éxito!');
    } catch (err) {
      console.error('Error al conectar con el backend:', err);
      setErrorMessage('Ocurrió un error al procesar el depósito con el servidor.');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- FUNCIÓN DE RETIROS ---
  const handleWithdrawSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    const amountNum = parseFloat(String(withdrawAmountUsdt || '0'));
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage('Ingresa un monto válido para retirar.');
      return;
    }

    const currentBalance = (wallet as any)?.balanceUsdt || 0;
    if (amountNum > currentBalance) {
      setErrorMessage('Saldo insuficiente. Tu balance actual es $' + '{currentBalance.toFixed(2)} USDT.');
      return;
    }
     if (paymentMethod === 'BINANCE' && !String(withdrawBinanceId || '').trim()) {
      setErrorMessage('Por favor ingresa tu Binance Pay ID o correo registrado en Binance.');
      return;
    }

    if (paymentMethod === 'PAGOMOVIL' && (!String(withdrawPhone || '').trim() || !String(withdrawCi || '').trim())) {
      setErrorMessage('Completa el teléfono y cédula para transferirte por Pago Móvil.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const rate = (wallet as any)?.exchangeRate || 40;
      const vesAmount = amountNum * rate;

      const newTx: any = {
        id: 'RET-' + String(Date.now()).slice(-6),
        type: 'WITHDRAW',
        amountUsdt: amountNum,
        amountVes: vesAmount,
        method: paymentMethod,
        reference: 'REF-RET-' + Math.floor(100000 + Math.random() * 900000),
        status: 'COMPLETED',
        description: paymentMethod === 'BINANCE'
          ? 'Retiro enviado a Binance Pay (' + withdrawBinanceId + ')'
          : 'Retiro Pago Móvil (' + withdrawPhone + ' / CI ' + withdrawCi + ')',
        date: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
      };

      if (onAddTransaction) (onAddTransaction as any)(newTx);
      if (onUpdateBalance) (onUpdateBalance as any)(-amountNum);

      setSuccessMessage('¡Retiro enviado exitosamente! Se transfirieron $' + amountNum.toFixed(2) + ' USDT.');

      setWithdrawBinanceId('');
      setWithdrawPhone('');
      setWithdrawCi('');
    }, 1000);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Cajero Automático · Bingo Fortuna
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Tasa BCV: {wallet.exchangeRate.toFixed(2)} Bs / USDT</span>
                <span>·</span>
                <span className="text-emerald-400 font-medium">Pagos 24/7 Automatizados</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Bar */}
        <div className="px-6 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Tu Saldo Disponible</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-display text-white tabular-nums">
                ${wallet.balanceUsdt.toFixed(2)} <span className="text-xs font-sans text-amber-400">USDT</span>
              </span>
              <span className="text-sm font-medium text-slate-400 tabular-nums">
                ≈ {wallet.balanceVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('DEPOSIT');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'DEPOSIT'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" /> Recargar (Depositar)
            </button>
            <button
              onClick={() => {
                setActiveTab('WITHDRAW');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'WITHDRAW'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Retirar Ganancias
            </button>
            <button
              onClick={() => {
                setActiveTab('HISTORY');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'HISTORY'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Historial
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {successMessage && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-start gap-3 text-emerald-200 text-sm animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-xl flex items-start gap-3 text-rose-200 text-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* TAB: DEPOSIT */}
          {activeTab === 'DEPOSIT' && (
            <div className="space-y-5">
              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Selecciona método de pago:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('PAGOMOVIL');
                      setErrorMessage(null);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      paymentMethod === 'PAGOMOVIL'
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                        Pago Móvil (Bs)
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-sans">
                          Instantáneo
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Banesco, BDV, Mercantil y todos los bancos
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('BINANCE');
                      setErrorMessage(null);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      paymentMethod === 'BINANCE'
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                        Binance Pay (USDT)
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-sans">
                          0% Comisión
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        USDT Pay ID 
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* DETAILS BOX FOR PAGOMÓVIL */}
              {paymentMethod === 'PAGOMOVIL' && (
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Datos de Pago Móvil Oficial
                    </span>
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Cuenta Verificada
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Banco Destino</span>
                        <span className="font-semibold text-white">0102 - Banco de Venezuela</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('0102', 'banco')}
                        className="text-slate-400 hover:text-white p-1"
                        title="Copiar banco"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Teléfono</span>
                        <span className="font-semibold text-white font-mono">0424-6163113</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('04246163113', 'tel')}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        {copiedField === 'tel' ? (
                          <span className="text-emerald-400 text-[10px]">Copiado</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Cédula / RIF</span>
                        <span className="font-semibold text-white font-mono">V-11282487</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('11282487', 'ci')}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        {copiedField === 'ci' ? (
                          <span className="text-emerald-400 text-[10px]">Copiado</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Beneficiario</span>
                        <span className="font-semibold text-white">Nerbelis Valdeblanques</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DETAILS BOX FOR BINANCE */}
              
                    {/* DATOS DE BINANCE PAY */}
<div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 space-y-3 mt-3">
  <div className="flex items-center justify-between">
    <div>
      <span className="text-slate-400 block text-[11px]">Binance Pay ID (PID)</span>
      <span className="font-semibold text-white font-mono">112986568</span>
    </div>
    <button
      type="button"
      onClick={() => handleCopy('112986568', 'binance')}
      className="text-slate-400 hover:text-white p-1"
    >
      {copiedField === 'binance' ? (
        <span className="text-emerald-400 text-[10px]">Copiado</span>
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  </div>
  <div>
    <span className="text-slate-400 block text-[11px] mb-1">Alias / Usuario: nercovalch</span>
  </div>
</div>
              

              {/* FORM: INPUT REPORT */}
            <form onSubmit={(e: any) => { e.preventDefault(); void handleDepositSubmit(e); }} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Monto a Recargar:
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {['2', '5', '10', '20'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDepositAmountUsdt(val)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          depositAmountUsdt === val
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        ${val} USDT
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-bold">$</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={depositAmountUsdt}
                      onChange={(e) => setDepositAmountUsdt(e.target.value)}
                      className="w-full pl-8 pr-28 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500 text-sm"
                      placeholder="Monto en USDT"
                      required
                    />
                    <div className="absolute right-3 top-2 text-xs font-medium text-slate-400">
                      ≈{' '}
                      {(parseFloat(depositAmountUsdt || '0') * wallet.exchangeRate).toLocaleString('es-VE', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      Bs
                    </div>
                  </div>
                </div>

                {paymentMethod === 'PAGOMOVIL' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Tu Banco Emisor:
                      </label>
                      <select
                        value={depositPagoMovilBank}
                        onChange={(e) => setDepositPagoMovilBank(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                      >
                        {VENEZUELAN_BANKS.map((b) => (
                          <option key={b.code} value={b.code}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        N° de Referencia (últimos 4 u 8 dígitos):
                      </label>
                      <input
                        type="text"
                        value={depositPagoMovilRef}
                        onChange={(e) => setDepositPagoMovilRef(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                        placeholder="Ej. 849201"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      ID de Orden o Hash de Binance Pay:
                    </label>
                    <input
                      type="text"
                      value={depositBinanceHash}
                      onChange={(e) => setDepositBinanceHash(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      placeholder="Ej. 294820194 o 0x8a9f..."
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verificando con switch de pagos...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Validar y Acreditar Saldo Inmediato
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB: WITHDRAW */}
          {activeTab === 'WITHDRAW' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Método para recibir tus ganancias:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PAGOMOVIL')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'PAGOMOVIL'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-400" /> Pago Móvil
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Recibe directo en tu cuenta en Bs</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BINANCE')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'BINANCE'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-400" /> Binance Pay (USDT)
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Transferencia instantánea a tu Pay ID</p>
                  </button>
                </div>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Monto a Retirar (Mínimo $2.00 USDT):
                    </label>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmountUsdt(wallet.balanceUsdt.toFixed(2))}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      Retirar Todo (${wallet.balanceUsdt.toFixed(2)})
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-bold">$</span>
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max={wallet.balanceUsdt}
                      value={withdrawAmountUsdt}
                      onChange={(e) => setWithdrawAmountUsdt(e.target.value)}
                      className="w-full pl-8 pr-28 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500 text-sm"
                      placeholder="Monto"
                      required
                    />
                    <div className="absolute right-3 top-2 text-xs font-medium text-slate-400">
                      ≈{' '}
                      {(parseFloat(withdrawAmountUsdt || '0') * wallet.exchangeRate).toLocaleString('es-VE', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      Bs
                    </div>
                  </div>
                </div>

                {paymentMethod === 'PAGOMOVIL' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Banco donde recibirás:
                      </label>
                      <select
                        value={withdrawBank}
                        onChange={(e) => setWithdrawBank(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                      >
                        {VENEZUELAN_BANKS.map((b) => (
                          <option key={b.code} value={b.code}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Tu Teléfono Pago Móvil:
                        </label>
                        <input
                          type="tel"
                          value={withdrawPhone}
                          onChange={(e) => setWithdrawPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                          placeholder="Ej. 04141234567"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Cédula de Identidad:
                        </label>
                        <input
                          type="text"
                          value={withdrawCi}
                          onChange={(e) => setWithdrawCi(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                          placeholder="Ej. V-25123456"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Tu Binance Pay ID o correo Binance:
                    </label>
                    <input
                      type="text"
                      value={withdrawBinanceId}
                      onChange={(e) => setWithdrawBinanceId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      placeholder="Ej. 182930491 o usuario@correo.com"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || wallet.balanceUsdt <= 0}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Procesando transferencia...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4" /> Solicitar Retiro Instantáneo
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Últimos Movimientos del Cajero
              </span>

              {transactions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No hay transacciones registradas aún.
                </div>
              ) : (
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-900/50">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            tx.type === 'DEPOSIT' || tx.type === 'PRIZE'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {tx.type === 'DEPOSIT' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : tx.type === 'PRIZE' ? (
                            <Coins className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{tx.description}</div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                            <span>Ref: {tx.reference || tx.id}</span>
                            <span>·</span>
                            <span>{tx.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-bold font-mono text-sm block ${
                            tx.type === 'DEPOSIT' || tx.type === 'PRIZE'
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {tx.type === 'DEPOSIT' || tx.type === 'PRIZE' ? '+' : '-'}${tx.amountUsdt.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {tx.amountVes.toLocaleString('es-VE', { minimumFractionDigits: 1 })} Bs
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encriptación SSL y pagos garantizados</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cerrar Cajero
          </button>
        </div>
      </div>
    </div>
  );
};
