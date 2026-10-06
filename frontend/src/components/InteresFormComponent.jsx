import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation, Link } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";
import axios from 'axios';
import LoadingModal from './shared/LoadingModal';
import { useVehicleDropdowns } from '../hooks/useVehicleDropdowns';

import { WHATSAPP_DISPLAY, whatsappUrl } from '../services/whatsapp';

const inputClass = (invalid) => `vf-input${invalid ? ' is-invalid' : ''}`;

const FieldError = ({ children }) => (
  <p className="vf-error" role="alert">
    <span className="material-symbols-outlined" aria-hidden="true">error</span>
    {children}
  </p>
);
FieldError.propTypes = { children: PropTypes.node };

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 4.54 0 8.23 3.69 8.23 8.23s-3.69 8.24-8.23 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
  </svg>
);

const InteresForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    celular: '',
    wppcheck: false,
    marca: '',
    linea: '',
    modelo: '',
    km: '',
    price: '',
    showModal: false,
    captcha: '',
    showLoadingModal: false,
    submitStatus: 'loading'
  });

  const location = useLocation();

  const {
    marcaDropdown: hookMarcaDropdown,
    lineaDropdown: hookLineaDropdown,
    fetchLineas
  } = useVehicleDropdowns();

  const sortedMarcaOptions = hookMarcaDropdown && Array.isArray(hookMarcaDropdown)
    ? [...hookMarcaDropdown].sort((a, b) => a.marca.localeCompare(b.marca))
    : [];

  const sortedLineaOptions = hookLineaDropdown && Array.isArray(hookLineaDropdown)
    ? [...hookLineaDropdown].sort((a, b) => {
        const aText = a.linea + ' ' + (a.version || '');
        const bText = b.linea + ' ' + (b.version || '');
        return aText.localeCompare(bText);
      })
    : [];

  useEffect(() => {
    if (location.state) {
      setFormData(prev => ({
        ...prev,
        marca: location.state.marca,
        linea: location.state.linea,
        modelo: location.state.modelo,
        km: location.state.km,
        price: location.state.price,
        showModal: true
      }));
    }
  }, [location.state]);

  const validateModelo = (value) => {
    const currentYear = new Date().getFullYear();
    const year = parseInt(value);
    return year >= 1920 && year <= currentYear + 1;
  };

  const validateKilometraje = (value) => {
    const km = parseInt(value.replace(/\D/g, ''));
    return !isNaN(km) && km >= 0 && km < 10000000;
  };

  const validatePrecio = (value) => {
    const precio = parseInt(value.replace(/\D/g, ''));
    return !isNaN(precio) && precio > 0 && precio < 100000000000;
  };

  const validateCelular = (value) => {
    const celularRegex = /^3\d{9}$/;
    return celularRegex.test(value);
  };

  const formatPrice = (value) => {
    const number = parseInt(value.replace(/\D/g, ''));
    if (!isNaN(number)) {
      return `$ ${number.toLocaleString('es-CO')}`;
    }
    return value;
  };

  const handleChange = event => {
    const { name, value, type, checked } = event.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    let processedValue = value;

    switch (name) {
      case 'celular':
        processedValue = value.replace(/\D/g, '').slice(0, 10);
        break;
      case 'modelo':
        processedValue = value.replace(/\D/g, '').slice(0, 4);
        break;
      case 'km':
        processedValue = value.replace(/\D/g, '').slice(0, 7);
        break;
      case 'price':
        processedValue = value.replace(/\D/g, '');
        break;
      default:
        processedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleCaptchaChange = (value) => {
    setFormData(prev => ({ ...prev, captcha: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.captcha) {
      alert('Por favor complete el captcha');
      return;
    }

    if (formData.modelo && !validateModelo(formData.modelo)) {
      alert('Por favor ingrese un año válido entre 1920 y ' + (new Date().getFullYear() + 1));
      return;
    }

    if (formData.km && !validateKilometraje(formData.km)) {
      alert('Por favor ingrese un kilometraje válido');
      return;
    }

    if (formData.price && !validatePrecio(formData.price)) {
      alert('Por favor ingrese un precio razonable');
      return;
    }

    setFormData(prev => ({ ...prev, showLoadingModal: true, submitStatus: 'loading' }));

    try {
      const numericPrice = formData.price ? parseInt(formData.price.replace(/\D/g, '')) : '';

      await axios.post('/api/interescompra', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        celular: formData.celular,
        wpp_check: formData.wppcheck,
        marca: formData.marca,
        linea: formData.linea,
        modelo: formData.modelo,
        km: formData.km,
        price: String(numericPrice),
        recaptcha_token: formData.captcha
      });
      setFormData(prev => ({ ...prev, submitStatus: 'success' }));
    } catch (error) {
      console.error('Error:', error);
      setFormData(prev => ({ ...prev, submitStatus: 'error' }));
    }
  };

  const handleModalClose = () => {
    setFormData(prev => ({ ...prev, showModal: false }));
  };

  const renderMarcaField = () => {
    if (location.state?.marca) {
      return (
        <input
          className="vf-input"
          id="marca"
          name="marca"
          type="text"
          value={formData.marca}
          onChange={handleChange}
          readOnly
        />
      );
    }
    return (
      <select
        className="vf-input"
        id="marca"
        name="marca"
        value={formData.marca}
        onChange={(e) => {
          handleChange(e);
          fetchLineas(e.target.value);
        }}
      >
        <option value="">Seleccione una marca</option>
        {sortedMarcaOptions.map(marca => (
          <option key={marca.id} value={marca.marca}>
            {marca.marca}
          </option>
        ))}
      </select>
    );
  };

  const renderLineaField = () => {
    if (location.state?.linea) {
      return (
        <input
          className="vf-input"
          id="linea"
          name="linea"
          type="text"
          value={formData.linea}
          onChange={handleChange}
          readOnly
        />
      );
    }
    return (
      <select
        className="vf-input"
        id="linea"
        name="linea"
        value={formData.linea}
        onChange={handleChange}
        disabled={!formData.marca}
      >
        <option value="">Seleccione una línea</option>
        {sortedLineaOptions.map(linea => {
          const text = linea.linea + ' ' + (linea.version || '');
          return (
            <option key={linea.id} value={text}>
              {text}
            </option>
          );
        })}
      </select>
    );
  };

  return (
    <>
      {formData.showModal && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 px-5" role="dialog" aria-modal="true">
          <div className="w-full max-w-md border-t-4 border-victoria-red bg-white shadow-[0_30px_90px_rgba(0,0,0,.35)]">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
              <h2 className="!text-lg font-black tracking-[-0.02em] text-victoria-dark">Vehículo no encontrado</h2>
              <button type="button" className="grid h-9 w-9 place-items-center border border-zinc-300 text-lg leading-none text-victoria-dark" onClick={handleModalClose} aria-label="Cerrar">×</button>
            </div>
            <div className="px-6 py-6">
              <p className="text-sm leading-6 text-zinc-600">
                En el momento no tenemos el vehículo {formData.marca} {formData.linea} {formData.modelo} deseado en nuestro stock actual. Diligencia tus datos y en breve te contactaremos con una oferta
                de tu vehículo deseado
              </p>
            </div>
            <div className="flex justify-end border-t border-zinc-200 px-6 py-5">
              <button
                type="button"
                className="rounded-xl bg-victoria-red px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-800"
                onClick={handleModalClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <LoadingModal
        show={formData.showLoadingModal}
        status={formData.submitStatus}
        onClose={() => {
          setFormData(prev => ({ ...prev, showLoadingModal: false }));
          if (formData.submitStatus === 'success') {
            window.location.href = '/';
          }
        }}
      />

      <div className="vf-page">
        <nav aria-label="breadcrumb" className="vf-crumbs">
          <Link to="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <span>Interés de compra</span>
        </nav>
        <h1 className="vf-title">Interés de compra</h1>
        <p className="vf-sub">Cuéntanos qué carro buscas y te avisamos apenas tengamos una opción para ti.</p>

        <form onSubmit={handleSubmit} className="vf-card">
          <section className="vf-section" aria-labelledby="vf-sec-datos">
            <h2 className="vf-section-title" id="vf-sec-datos">Tus datos</h2>
            <p className="vf-section-hint">Para saber a quién contactar.</p>
            <div className="vf-grid">
              <div>
                <label className="vf-label" htmlFor="nombre">Nombre</label>
                <input
                  className="vf-input"
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Escribe tu nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="vf-label" htmlFor="apellido">Apellido</label>
                <input
                  className="vf-input"
                  id="apellido"
                  name="apellido"
                  type="text"
                  placeholder="Escribe tu apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                />
              </div>

              <div className="vf-span2">
                <label className="vf-label" htmlFor="celular">Celular</label>
                <input
                  className={inputClass(formData.celular && !validateCelular(formData.celular))}
                  id="celular"
                  name="celular"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 3001234567"
                  value={formData.celular}
                  onChange={handleChange}
                />
                {formData.celular && !validateCelular(formData.celular) && (
                  <FieldError>Por favor ingrese un número de celular válido</FieldError>
                )}
              </div>
            </div>
          </section>

          <section className="vf-section" aria-labelledby="vf-sec-carro">
            <h2 className="vf-section-title" id="vf-sec-carro">El carro que buscas</h2>
            <p className="vf-section-hint">Mientras más detalles, mejor la oferta.</p>
            <div className="vf-grid">
              <div>
                <label className="vf-label" htmlFor="marca">Marca</label>
                {renderMarcaField()}
              </div>

              <div>
                <label className="vf-label" htmlFor="linea">Línea</label>
                {renderLineaField()}
              </div>

              <div>
                <label className="vf-label" htmlFor="modelo">Modelo</label>
                <input
                  className={inputClass(formData.modelo && !validateModelo(formData.modelo))}
                  id="modelo"
                  name="modelo"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 2020"
                  value={formData.modelo}
                  onChange={handleChange}
                />
                {formData.modelo && !validateModelo(formData.modelo) && (
                  <FieldError>Por favor ingrese un año válido</FieldError>
                )}
              </div>

              <div>
                <label className="vf-label" htmlFor="km">Kilometraje</label>
                <input
                  className={inputClass(formData.km && !validateKilometraje(formData.km))}
                  id="km"
                  name="km"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 50000"
                  value={formData.km}
                  onChange={handleChange}
                />
                {formData.km && !validateKilometraje(formData.km) && (
                  <FieldError>El kilometraje debe ser menor a 10.000.000</FieldError>
                )}
              </div>

              <div className="vf-span2">
                <label className="vf-label" htmlFor="price">Precio</label>
                <input
                  className={inputClass(formData.price && !validatePrecio(formData.price))}
                  id="price"
                  name="price"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: $ 50.000.000"
                  value={formatPrice(formData.price)}
                  onChange={handleChange}
                />
                {formData.price && !validatePrecio(formData.price) && (
                  <FieldError>Por favor ingresa un precio razonable :)</FieldError>
                )}
              </div>
            </div>

            <label className="vf-check" htmlFor="wppCheckbox">
              <input
                id="wppCheckbox"
                name="wppcheck"
                type="checkbox"
                defaultChecked={formData.wppcheck}
                onChange={handleChange}
              />
              <span>¿Aceptas comunicación vía Whatsapp? <a href="/politicas-de-privacidad" target="_blank" rel="noopener noreferrer">Ver política de privacidad</a></span>
            </label>
          </section>

          <div className="vf-captcha">
            <ReCAPTCHA
              sitekey={"6Ld0PcgqAAAAAFbIAfRwUtK5CNjuJli7-iyxtbeJ"}
              onChange={handleCaptchaChange}
            />
          </div>

          <div className="vf-actions">
            <button
              type="submit"
              className="vf-btn vf-btn--primary vf-btn--block"
              disabled={formData.showLoadingModal && formData.submitStatus === 'loading'}
              aria-busy={formData.showLoadingModal && formData.submitStatus === 'loading'}
            >
              {formData.showLoadingModal && formData.submitStatus === 'loading' ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
          <p className="vf-reassure">
            <span className="material-symbols-outlined" aria-hidden="true">lock</span>
            Tus datos solo se usan para contactarte.
          </p>

          <p className="vf-wa-line">
            ¿Prefieres escribirnos?
            <a href={whatsappUrl('Hola Victoriautos, quiero información sobre un carro que estoy buscando.')} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> WhatsApp {WHATSAPP_DISPLAY}
            </a>
          </p>
        </form>
      </div>
    </>
  );
};

export default InteresForm;
