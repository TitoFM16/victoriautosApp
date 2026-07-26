// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import LoadingModal from '../shared/LoadingModal';
import { Modal } from 'bootstrap';

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
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="compraModalLabel">Comprar Vehiculo</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="container">
                  <p className="text-muted">Diligencía los datos y en breve un asesor te contactará</p>
                  <div className="row">
                    <div className="col-12 col-md-6 py-2">
                      <div className="form-group">
                        <label htmlFor="nombre">Nombre</label>
                        <input
                          className="form-control"
                          id="nombre"
                          name="nombre"
                          type="text"
                          placeholder="Escribe tu nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6 py-2">
                      <div className="form-group">
                        <label htmlFor="apellido">Apellido</label>
                        <input
                          className="form-control"
                          id="apellido"
                          name="apellido"
                          type="text"
                          placeholder="Escribe tu apellido"
                          value={formData.apellido}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6 py-2">
                      <div className="form-group">
                        <label htmlFor="celular">Celular</label>
                        <input
                          className={`form-control ${formData.celular && !validateCelular(formData.celular) ? 'is-invalid' : ''}`}
                          id="celular"
                          name="celular"
                          type="text"
                          placeholder="Ej: 3001234567"
                          value={formData.celular}
                          onChange={handleChange}
                        />
                        {formData.celular && !validateCelular(formData.celular) && (
                          <div className="invalid-feedback">
                            Por favor ingrese un número de celular válido
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-12 col-md-6 py-2">
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          className={`form-control ${formData.email && !validateEmail(formData.email) ? 'is-invalid' : ''}`}
                          id="email"
                          name="email"
                          type="text"
                          placeholder="Escribe tu email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                        {formData.email && !validateEmail(formData.email) && (
                          <div className="invalid-feedback">
                            Por favor ingrese un email válido
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-12 col-md-6 py-2">
                      <div className="form-group">
                        <label htmlFor="cedula">Cédula</label>
                        <input
                          className={`form-control ${formData.cedula && !validateCedula(formData.cedula) ? 'is-invalid' : ''}`}
                          id="cedula"
                          name="cedula"
                          type="text"
                          placeholder="Escribe tu cédula"
                          value={formData.cedula}
                          onChange={handleChange}
                        />
                        {formData.cedula && !validateCedula(formData.cedula) && (
                          <div className="invalid-feedback">
                            Por favor ingrese una cédula válida
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-12 py-4">
                      <div className="form-check">
                        <input
                          className="form-check-input" 
                          id="wppCheckbox"
                          name="wppcheck" 
                          type="checkbox" 
                          checked={formData.wppcheck} 
                          onChange={handleChange} 
                        />
                        <label className="form-check-label left-label-position-check" htmlFor="wppCheckbox">
                          ¿Aceptas comunicacion via Whatsapp?
                        </label>
                      </div>          
                    </div>

                    <div className="col-12 py-4">
                      <div id="recaptcha">
                        <ReCAPTCHA
                          sitekey={"6Ld0PcgqAAAAAFbIAfRwUtK5CNjuJli7-iyxtbeJ"}
                          onChange={handleCaptchaChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn cancel-button" data-bs-dismiss="modal">Cerrar</button>
              <button className="btn submit-button float-left mx-2 my-2"
                      type="submit"
                      onClick={handleSubmit}>Enviar</button>
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