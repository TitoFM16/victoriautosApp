import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";
import axios from 'axios';
import LoadingModal from './shared/LoadingModal';
import { useVehicleDropdowns } from '../hooks/useVehicleDropdowns';

const controlClass = 'mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-victoria-dark outline-none transition focus:border-victoria-red focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-zinc-100';
const invalidControlClass = 'mt-2 h-12 w-full rounded-xl border border-victoria-red bg-white px-3 text-sm text-victoria-dark outline-none transition focus:border-victoria-red focus:ring-2 focus:ring-red-100';
const labelClass = 'text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500';

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
          className={controlClass}
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
        className={controlClass}
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
          className={controlClass}
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
        className={controlClass}
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

      <div className="mx-auto max-w-[900px] px-5 py-10 sm:px-8 sm:py-14">
        <nav aria-label="breadcrumb" className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
          <Link to="/" className="!no-underline text-victoria-red hover:text-red-800">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-500">Interés de compra</span>
        </nav>
        <h1 className="mt-4 border-b border-zinc-200 pb-7 !text-4xl font-black leading-none tracking-[-0.05em] text-victoria-dark sm:!text-5xl">Interés de compra</h1>

        <form onSubmit={handleSubmit} className="mt-8 border border-zinc-200 bg-white p-6 sm:p-10">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="nombre">Nombre</label>
              <input
                className={controlClass}
                id="nombre"
                name="nombre"
                type="text"
                placeholder="Escribe tu nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="apellido">Apellido</label>
              <input
                className={controlClass}
                id="apellido"
                name="apellido"
                type="text"
                placeholder="Escribe tu apellido"
                value={formData.apellido}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="celular">Celular</label>
              <input
                className={formData.celular && !validateCelular(formData.celular) ? invalidControlClass : controlClass}
                id="celular"
                name="celular"
                type="text"
                placeholder="Ej: 3001234567"
                value={formData.celular}
                onChange={handleChange}
              />
              {formData.celular && !validateCelular(formData.celular) && (
                <p className="mt-2 text-xs font-bold text-victoria-red">
                  Por favor ingrese un número de celular válido
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="marca">Marca</label>
              {renderMarcaField()}
            </div>

            <div>
              <label className={labelClass} htmlFor="linea">Línea</label>
              {renderLineaField()}
            </div>

            <div>
              <label className={labelClass} htmlFor="modelo">Modelo</label>
              <input
                className={formData.modelo && !validateModelo(formData.modelo) ? invalidControlClass : controlClass}
                id="modelo"
                name="modelo"
                type="text"
                placeholder="Ej: 2020"
                value={formData.modelo}
                onChange={handleChange}
              />
              {formData.modelo && !validateModelo(formData.modelo) && (
                <p className="mt-2 text-xs font-bold text-victoria-red">
                  Por favor ingrese un año válido
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="km">Kilometraje</label>
              <input
                className={formData.km && !validateKilometraje(formData.km) ? invalidControlClass : controlClass}
                id="km"
                name="km"
                type="text"
                placeholder="Ej: 50000"
                value={formData.km}
                onChange={handleChange}
              />
              {formData.km && !validateKilometraje(formData.km) && (
                <p className="mt-2 text-xs font-bold text-victoria-red">
                  El kilometraje debe ser menor a 10.000.000
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="price">Precio</label>
              <input
                className={formData.price && !validatePrecio(formData.price) ? invalidControlClass : controlClass}
                id="price"
                name="price"
                type="text"
                placeholder="Ej: $ 50.000.000"
                value={formatPrice(formData.price)}
                onChange={handleChange}
              />
              {formData.price && !validatePrecio(formData.price) && (
                <p className="mt-2 text-xs font-bold text-victoria-red">
                  Por favor ingresa un precio razonable :)
                </p>
              )}
            </div>
          </div>

          <label className="mt-6 flex items-center gap-3 text-sm font-bold text-zinc-700" htmlFor="wppCheckbox">
            <input
              className="h-5 w-5 accent-victoria-red"
              id="wppCheckbox"
              name="wppcheck"
              type="checkbox"
              defaultChecked={formData.wppcheck}
              onChange={handleChange}
            />
            ¿Aceptas comunicación vía Whatsapp?
          </label>

          <div className="mt-6">
            <ReCAPTCHA
              sitekey={"6Ld0PcgqAAAAAFbIAfRwUtK5CNjuJli7-iyxtbeJ"}
              onChange={handleCaptchaChange}
            />
          </div>

          <button type="submit" className="mt-6 rounded-xl bg-victoria-red px-7 py-4 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-red-800">Enviar</button>
        </form>
      </div>
    </>
  );
};

export default InteresForm;
