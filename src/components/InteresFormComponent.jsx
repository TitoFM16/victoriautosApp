import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import ReCAPTCHA from "react-google-recaptcha";
import axios from 'axios';
import LoadingModal from './shared/LoadingModal';

const InteresForm = (props) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    celular: '',
    email: '',
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

  const handleChange = event => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    setFormData(prev => ({ ...prev, showLoadingModal: true, submitStatus: 'loading' }));

    try {
      await axios.post('/api/interescompra', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        celular: formData.celular,
        email: formData.email,
        wppcheck: formData.wppcheck,
        marca: formData.marca,
        linea: formData.linea,
        modelo: formData.modelo,
        km: formData.km,
        price: formData.price,
        'g-recaptcha-response': formData.captcha
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

  return (
    <>
      {formData.showModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Vehículo no encontrado</h5>
                <button type="button" className="btn-close" onClick={handleModalClose}></button>
              </div>
              <div className="modal-body">
                <p>
                  En el momento no tenemos el vehículo {formData.marca} {formData.linea} {formData.modelo}  
                  en nuestro stock actual. Diligencia tus datos y en breve te contactaremos con una oferta 
                  de tu vehículo deseado
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn submit-button" onClick={handleModalClose}>
                  Cerrar
                </button>
              </div>
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
            window.location.href = '/home';
          }
        }}
      />

      <form onSubmit={handleSubmit}>
        <div className="container">
          <Breadcrumb>
            <BreadcrumbItem><Link to="/home">Inicio</Link></BreadcrumbItem>
            <BreadcrumbItem active>Interes de compra</BreadcrumbItem>
          </Breadcrumb> 
          <div className="col-12">
            <h3>Interes de compra</h3>
            <hr />
          </div>   
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
                  className="form-control"
                  id="celular"
                  name="celular"
                  type="text"
                  placeholder="Escribe tu celular"
                  value={formData.celular}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-12 col-md-6 py-2">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  className="form-control"
                  id="email"
                  name="email"
                  type="text"
                  placeholder="Escribe tu email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-12 col-md-6 py-2">
              <div className="form-group">
                <label htmlFor="marca">Marca</label>
                <input
                  className="form-control"
                  id="marca"
                  name="marca"
                  type="text"
                  placeholder="Escribe tu marca"
                  value={formData.marca}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-12 col-md-6 py-2">
              <div className="form-group">
                <label htmlFor="linea">Linea</label>
                <input
                  className="form-control"
                  id="linea"
                  name="linea"
                  type="text"
                  placeholder="Escribe tu linea"
                  value={formData.linea}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-12 col-md-6 py-2">
              <div className="form-group">
                <label htmlFor="modelo">modelo</label>
                <input
                  className="form-control"
                  id="modelo"
                  name="modelo"
                  type="text"
                  placeholder="Escribe tu modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-12 col-md-6 py-2">
              <div className="form-group">
                <label htmlFor="km">km</label>
                <input
                  className="form-control"
                  id="km"
                  name="km"
                  type="text"
                  placeholder="Escribe tu km"
                  value={formData.km}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-12 col-md-6 py-2">
              <div className="form-group">
                <label htmlFor="price">Precio</label>
                <input
                  className="form-control"
                  id="price"
                  name="price"
                  type="text"
                  placeholder="Escribe tu Precio"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-12 py-4">
              <div className="form-check">
                <input
                  className="form-check-input" 
                  id="wppCheckbox"
                  name="wppcheck" 
                  type="checkbox" 
                  defaultChecked={formData.wppcheck} 
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

            <div className="col-12 py-4">
              <button type="submit" className="btn submit-button">Enviar</button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default InteresForm;