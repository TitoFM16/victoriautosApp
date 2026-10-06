// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import LoadingModal from '../shared/LoadingModal';
import { Modal } from 'bootstrap';

const controlClass = 'mt-2 h-12 w-full rounded-xl border border-[var(--va-line)] bg-white px-4 text-base text-victoria-dark outline-none transition focus:border-victoria-red focus:ring-2 focus:ring-red-100';
const invalidControlClass = 'mt-2 h-12 w-full rounded-xl border border-victoria-red bg-white px-4 text-base text-victoria-dark outline-none transition focus:border-victoria-red focus:ring-2 focus:ring-red-100';
const labelClass = 'text-sm font-semibold text-victoria-dark';

const CompraModalContent = ({ car }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    celular: '',
    email: '',
    cedula: '',
    wppcheck: false,
    captcha: '',
    showLoadingModal: false,
    submitStatus: 'loading'
  });

  const validateCelular = (value) => {
    const celularRegex = /^3\d{9}$/;
    return celularRegex.test(value);
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validateCedula = (value) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue && Number(numericValue) < 939334212300;
  };

  const handleChange = event => {
    const { name, type, value, checked } = event.target;

    if (name === 'celular') {
      // Only allow numbers and limit to 10 digits
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
      }
    } else if (name === 'cedula') {
      // Only allow numbers
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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

    setFormData(prev => ({ ...prev, showLoadingModal: true, submitStatus: 'loading' }));

    try {
      await axios.post('/api/compra', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        celular: formData.celular,
        email: formData.email,
        cedula: formData.cedula,
        wpp_check: formData.wppcheck,
        car_id: car,
        recaptcha_token: formData.captcha
      });
      setFormData(prev => ({ ...prev, submitStatus: 'success' }));
    } catch (error) {
      console.error('Error:', error);
      setFormData(prev => ({ ...prev, submitStatus: 'error' }));
    }
  };

  return (
    <>
      <div className="modal fade" id="compraModal" tabIndex="-1" aria-labelledby="compraModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content public-modal">
            <div className="flex items-center justify-between border-b border-[var(--va-line)] px-5 py-4 sm:px-6">
              <h2 className="!text-xl font-extrabold tracking-[-0.02em] text-victoria-dark" id="compraModalLabel">Comprar Vehículo</h2>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-[var(--va-line)] text-xl leading-none text-victoria-dark" data-bs-dismiss="modal" aria-label="Close">×</button>
            </div>
            <div className="px-5 py-5 sm:px-6">
              <form onSubmit={handleSubmit}>
                <p className="text-sm text-[var(--va-muted)]">Diligencia los datos y en breve un asesor te contactará</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
                    <label className={labelClass} htmlFor="email">Email</label>
                    <input
                      className={formData.email && !validateEmail(formData.email) ? invalidControlClass : controlClass}
                      id="email"
                      name="email"
                      type="text"
                      placeholder="Escribe tu email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {formData.email && !validateEmail(formData.email) && (
                      <p className="mt-2 text-xs font-bold text-victoria-red">
                        Por favor ingrese un email válido
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="cedula">Cédula</label>
                    <input
                      className={formData.cedula && !validateCedula(formData.cedula) ? invalidControlClass : controlClass}
                      id="cedula"
                      name="cedula"
                      type="text"
                      placeholder="Escribe tu cédula"
                      value={formData.cedula}
                      onChange={handleChange}
                    />
                    {formData.cedula && !validateCedula(formData.cedula) && (
                      <p className="mt-2 text-xs font-bold text-victoria-red">
                        Por favor ingrese una cédula válida
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
                    checked={formData.wppcheck}
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
              </form>
            </div>
            <div className="flex justify-end gap-3 border-t border-[var(--va-line)] px-5 py-4 sm:px-6">
              <button
                type="button"
                className="rounded-full border border-[var(--va-line)] bg-white px-6 py-3 text-sm font-semibold text-victoria-dark transition hover:border-victoria-dark"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
              <button
                className="rounded-full bg-victoria-red px-8 py-3 text-sm font-semibold text-white transition hover:bg-[var(--va-accent-hover)]"
                type="submit"
                onClick={handleSubmit}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>

      <LoadingModal
        show={formData.showLoadingModal}
        status={formData.submitStatus}
        onClose={() => {
          setFormData(prev => ({ ...prev, showLoadingModal: false }));
          if (formData.submitStatus === 'success') {
            window.location.reload();
          }
        }}
      />
    </>
  );
};

CompraModalContent.propTypes = {
  car: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired
};
export default CompraModalContent;
