import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { WHATSAPP_DISPLAY, whatsappUrl } from '../../services/whatsapp';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 4.54 0 8.23 3.69 8.23 8.23s-3.69 8.24-8.23 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
  </svg>
);

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
    <div className="vf-calc">
      <div className="vf-card">
        <h2 className="vf-section-title">Calcula tu cuota</h2>
        <p className="vf-section-hint">Ingresa el valor y elige el plazo.</p>

        <div>
          <label className="vf-label" htmlFor="financedValue">Valor a financiar (COP)</label>
          <input
            id="financedValue"
            type="number"
            inputMode="numeric"
            value={financedValue}
            onChange={(e) => setFinancedValue(e.target.value)}
            placeholder="Ej: 40000000"
            className="vf-input"
          />
          <p className="vf-help">{financedValue ? formatMoney(parseFloat(financedValue) || 0) : 'Sin puntos ni comas.'}</p>
        </div>

        <fieldset className="vf-pills" style={{ marginTop: '1.5rem' }}>
          <legend className="vf-label">Plazo en meses</legend>
          {[12, 24, 36, 48, 60, 72].map((m) => (
            <label key={m} className="vf-pill">
              <input type="radio" name="term" value={m} checked={term === m} onChange={() => setTerm(m)} />
              <span>{m} meses</span>
            </label>
          ))}
        </fieldset>
      </div>

      <div className="vf-result" aria-live="polite">
        <p className="vf-result-label">Cuota mensual estimada</p>
        <p className="vf-result-amount">{installment > 0 ? formatMoney(installment) : '—'}</p>
        {installment <= 0 && <p className="vf-result-meta">Ingresa el valor a financiar para ver tu cuota.</p>}
        <p className="vf-result-meta">a {term} meses · tasa desde 1,42% E.A</p>
        <p className="vf-result-note">Valor estimado, sujeto a estudio de crédito.</p>
        <a href="#solicitud-credito" className="vf-btn vf-btn--primary vf-btn--block">
          Solicitar crédito
        </a>
        <p className="vf-wa-line">
          ¿Prefieres escribirnos?
          <a href={whatsappUrl('Hola Victoriautos, quiero información sobre financiación.')} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon /> WhatsApp {WHATSAPP_DISPLAY}
          </a>
        </p>
      </div>
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
    <form id="solicitud-credito" onSubmit={handleSubmit} className="vf-card vf-apply">
      <h2 className="vf-section-title">Solicitud de crédito</h2>
      <p className="vf-section-hint">Déjanos tus datos y un asesor te contacta.</p>

      <div className="vf-grid">
        <div>
          <label className="vf-label" htmlFor="nombre">Tu nombre (obligatorio)</label>
          <input
            className="vf-input"
            id="nombre"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="vf-label" htmlFor="apellido">Tu apellido (obligatorio)</label>
          <input
            className="vf-input"
            id="apellido"
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="vf-label" htmlFor="cedula">Cédula (obligatorio)</label>
          <input
            className="vf-input"
            id="cedula"
            type="text"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="vf-label" htmlFor="celular">Celular (obligatorio)</label>
          <input
            className="vf-input"
            id="celular"
            type="tel"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            required
          />
        </div>
        <div className="vf-span2">
          <label className="vf-label" htmlFor="email">Tu correo electrónico (obligatorio)</label>
          <input
            className="vf-input"
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="vf-span2">
          <label className="vf-label" htmlFor="sede">¿Dónde quieres ser atendido?</label>
          <select id="sede" name="sede" value={formData.sede} onChange={handleChange} className="vf-input">
            <option value="Victoriautos Pasto">Victoriautos Pasto</option>
          </select>
        </div>
        <div className="vf-span2">
          <label className="vf-label" htmlFor="observaciones">Observaciones</label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows={4}
            className="vf-input"
          />
        </div>
      </div>

      <label className="vf-check" htmlFor="privacyAccepted">
        <input
          id="privacyAccepted"
          type="checkbox"
          name="privacyAccepted"
          checked={formData.privacyAccepted}
          onChange={handleChange}
          required
        />
        <span>He leído y acepto las <a href="/politicas-de-privacidad" target="_blank" rel="noopener noreferrer">Políticas de Privacidad</a></span>
      </label>

      <div className="vf-actions">
        <button type="submit" className="vf-btn vf-btn--primary vf-btn--block">Enviar Solicitud</button>
      </div>
      <p className="vf-reassure">
        <span className="material-symbols-outlined" aria-hidden="true">lock</span>
        Tus datos solo se usan para contactarte.
      </p>
    </form>
  );
};

const CreditCalculatorPage = () => {
  return (
    <div className="vf-page vf-page--wide">
      <nav aria-label="breadcrumb" className="vf-crumbs">
        <Link to="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <span>Financiación</span>
      </nav>
      <h1 className="vf-title">Financiación</h1>
      <p className="vf-sub">Calcula tu cuota mensual en segundos y solicita tu crédito.</p>
      <CreditCalculator />
      <CreditApplicationForm />
    </div>
  );
};

export default CreditCalculatorPage;
