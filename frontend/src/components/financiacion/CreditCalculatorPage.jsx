import React, { useState, useEffect } from 'react';

// A helper function to calculate the monthly installment using the annuity formula.
// monthlyRate is derived from the annual effective rate (1.42% EA)
const calculateMonthlyInstallment = (loanAmount, term, annualRate = 0.0142) => {
  // Convert annual rate to monthly rate using the effective rate conversion
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  if (loanAmount <= 0 || term <= 0) return 0;
  // Standard annuity formula:
  return loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -term));
};

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
    <div style={{ border: '1px solid #ccc', padding: '1rem', maxWidth: '500px', margin: '1rem auto' }}>
      <h2>Calcular crédito</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Valor a financiar:
          <input
            type="number"
            value={financedValue}
            onChange={(e) => setFinancedValue(e.target.value)}
            placeholder="Ingresa el valor a financiar"
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Plazo en meses:</label>
        <div>
          {[12, 24, 36, 48, 60, 72].map((m) => (
            <label key={m} style={{ marginRight: '1rem' }}>
              <input
                type="radio"
                value={m}
                checked={term === m}
                onChange={() => setTerm(m)}
              />
              {m} meses
            </label>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <h3>
          Tu cuota mensual sería de: <strong>${installment.toFixed(2)}</strong>
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#555' }}>
          *Tasa de interés desde 1,42% E.A
        </p>
      </div>
      <button style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
        Solicitar crédito
      </button>
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
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', maxWidth: '500px', margin: '1rem auto' }}>
      <h2>Solicitud de crédito</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Tu nombre (obligatorio):
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Tu apellido (obligatorio):
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Cédula (obligatorio):
          <input
            type="text"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Celular (obligatorio):
          <input
            type="tel"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Tu correo electrónico (obligatorio):
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          ¿Dónde quieres ser atendido?
          <select name="sede" value={formData.sede} onChange={handleChange} style={{ display: 'block', width: '100%', padding: '0.5rem' }}>
            <option value="Victoriautos Pasto">Victoriautos Pasto</option>
            <option value="Oficina Asesor Crediticio">Oficina Asesor Crediticio</option>
            <option value="Victoriautos Pereira">Victoriautos Pereira</option>
            <option value="Automax Bucaramanga">Automax Bucaramanga</option>
            <option value="Automax Apartadó">Automax Apartadó</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Observaciones:
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          ></textarea>
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            name="privacyAccepted"
            checked={formData.privacyAccepted}
            onChange={handleChange}
            required
          />
          He leído y acepto las <a href="/politicas-de-privacidad" target="_blank" rel="noopener noreferrer">Políticas de Privacidad</a>
        </label>
      </div>
      <button type="submit" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>Enviar Solicitud</button>
    </form>
  );
};

const CreditCalculatorPage = () => {
  return (
    <div>
      <CreditCalculator />
      <CreditApplicationForm />
    </div>
  );
};

export default CreditCalculatorPage;
