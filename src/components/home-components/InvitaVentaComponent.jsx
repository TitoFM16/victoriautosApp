import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InvitaVentaComponent.css';
import iphoneImage from '../../assets/images/iphone-vende-vehiculo.webp';
import iphoneImageMobile from '../../assets/images/iphone-vende-vehiculo-mobile.webp';

const InvitaVentaComponent = () => {
  const navigate = useNavigate();

  return (
    <div className="container invita-venta-container py-5">
      <div className="row align-items-center">
        <div className="col-12 col-md-6 text-content order-0 order-md-0">
          <h2 className="mb-3">Conoce el valor de tu vehículo</h2>
          <p className="subtitle">
            Ingresa los datos de tu usado para conocer el valor aproximado de venta.
          </p>
          <button 
            className="submit-button mt-0 px-1"
            onClick={() => navigate('/vende')}
          >
            Vender mi vehículo
          </button>
        </div>
        <div className="col-12 col-md-6 image-content order-1 order-md-1">
          <img
            src={window.innerWidth > 768 ? iphoneImage : iphoneImageMobile}
            alt="Vende tu vehículo"
            className="img-fluid"
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default InvitaVentaComponent;
