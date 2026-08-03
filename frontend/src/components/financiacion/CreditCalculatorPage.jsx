import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const controlClass = 'mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-victoria-dark outline-none transition focus:border-victoria-red focus:ring-2 focus:ring-red-100';
const labelClass = 'text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500';

// A helper function to calculate the monthly installment using the annuity formula.
// monthlyRate is derived from the annual effective rate (1.42% EA)
const calculateMonthlyInstallment = (loanAmount, term, annualRate = 0.0142) => {
  // Convert annual rate to monthly rate using the effective rate conversion
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  if (loanAmount <= 0 || term <= 0) return 0;
  // Standard annuity formula:
  return loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -term));
};

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

const CreditCalculator = () => {
  const [financedValue, setFinancedValue] = useState('');
  const [term, setTerm] = useState(72); // default term in months
  const [installment, setInstallment] = useState(0);

  // Recalculate installment whenever the financed amount or term changes.
  useEffect(() => {
    const amount = parseFloat(financedValue) || 0;
    const result = calculateMonthlyInstallment(amount, term);
    setInstallment(result);
  }, [financedValue, term]);

  return (
    <div className="border border-zinc-200 bg-white p-6 sm:p-10">
      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-victoria-red">Financiación</p>
      <h2 className="mt-3 !text-2xl font-black tracking-[-0.03em] text-victoria-dark sm:!text-3xl">Calcular crédito</h2>

      <div className="mt-6">
        <label className={labelClass} htmlFor="financedValue">Valor a financiar</label>
        <input
          id="financedValue"
          type="number"
          value={financedValue}
          onChange={(e) => setFinancedValue(e.target.value)}
          placeholder="Ingresa el valor a financiar"
          className={controlClass}
        />
      </div>

      <div className="mt-6">
        <p className={labelClass}>Plazo en meses</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {[12, 24, 36, 48, 60, 72].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setTerm(m)}
              className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${term === m ? 'border-victoria-red bg-victoria-red text-white' : 'border-zinc-300 text-victoria-dark hover:border-victoria-dark'}`}
            >
              {m} meses
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-zinc-200 pt-6">
        <p className="text-sm font-bold text-zinc-600">
          Tu cuota mensual sería de: <span className="text-xl font-black text-victoria-red">{formatMoney(installment)}</span>
        </p>
        <p className="mt-2 text-xs text-zinc-500">*Tasa de interés desde 1,42% E.A</p>
      </div>

      <a
        href="#solicitud-credito"
        className="!no-underline mt-6 inline-block rounded-xl bg-victoria-red px-7 py-4 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-red-800"
      >
        Solicitar crédito
      </a>
    </div>
  );
};

const CreditApplicationForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    celular: '',
    email: '',
    sede: 'Victoriautos Pasto',
    observaciones: '',
    privacyAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you could send the formData to an API endpoint.
    console.log('Solicitud enviada:', formData);
    alert('Solicitud enviada');
  };

  return (
    <form id="solicitud-credito" onSubmit={handleSubmit} className="mt-8 border border-zinc-200 bg-white p-6 sm:p-10">
      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-victoria-red">Paso 2</p>
      <h2 className="mt-3 !text-2xl font-black tracking-[-0.03em] text-victoria-dark sm:!text-3xl">Solicitud de crédito</h2>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="nombre">Tu nombre (obligatorio)</label>
          <input
            className={controlClass}
            id="nombre"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="apellido">Tu apellido (obligatorio)</label>
          <input
            className={controlClass}
            id="apellido"
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="cedula">Cédula (obligatorio)</label>
          <input
            className={controlClass}
            id="cedula"
            type="text"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="celular">Celular (obligatorio)</label>
          <input
            className={controlClass}
            id="celular"
            type="tel"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="email">Tu correo electrónico (obligatorio)</label>
          <input
            className={controlClass}
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="sede">¿Dónde quieres ser atendido?</label>
          <select id="sede" name="sede" value={formData.sede} onChange={handleChange} className={controlClass}>
            <option value="Victoriautos Pasto">Victoriautos Pasto</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="observaciones">Observaciones</label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows={4}
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-victoria-dark outline-none transition focus:border-victoria-red focus:ring-2 focus:ring-red-100"
          />
        </div>
      </div>

      <label className="mt-6 flex items-start gap-3 text-sm font-bold text-zinc-700" htmlFor="privacyAccepted">
        <input
          className="mt-0.5 h-5 w-5 shrink-0 accent-victoria-red"
          id="privacyAccepted"
          type="checkbox"
          name="privacyAccepted"
          checked={formData.privacyAccepted}
          onChange={handleChange}
          required
        />
        He leído y acepto las <a href="/politicas-de-privacidad" target="_blank" rel="noopener noreferrer" className="text-victoria-red hover:text-red-800">Políticas de Privacidad</a>
      </label>

      <button type="submit" className="mt-6 rounded-xl bg-victoria-red px-7 py-4 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-red-800">Enviar Solicitud</button>
    </form>
  );
};

const CreditCalculatorPage = () => {
  return (
    <div className="mx-auto max-w-[700px] px-5 py-10 sm:px-8 sm:py-14">
      <nav aria-label="breadcrumb" className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
        <Link to="/" className="!no-underline text-victoria-red hover:text-red-800">Inicio</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-500">Financiación</span>
      </nav>
      <h1 className="mt-4 border-b border-zinc-200 pb-7 !text-4xl font-black leading-none tracking-[-0.05em] text-victoria-dark sm:!text-5xl">Financiación</h1>
      <CreditCalculator />
      <CreditApplicationForm />
    </div>
  );
};

export default CreditCalculatorPage;
