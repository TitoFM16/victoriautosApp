import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { carWhatsappUrl } from '../../services/whatsapp';
import { formatMoney } from '../../shared/utils';
import CompraModalContent from './compraModalContent';
import VehicleDetailComponent from '../shared/VehicleDetailComponent';
import LoadingComponent from '../shared/loadingComponent';

const WhatsAppGlyph = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.1L2 22l5-1.6A9.9 9.9 0 1 0 12.04 2Zm5.8 14c-.25.7-1.45 1.35-2 1.4-.5.07-1.1.1-1.77-.11-.4-.13-.92-.3-1.58-.59-2.8-1.2-4.62-4.03-4.76-4.22-.14-.18-1.13-1.5-1.13-2.86 0-1.36.71-2.03.96-2.3.25-.28.55-.35.73-.35h.52c.17 0 .4-.06.62.48.23.55.78 1.9.85 2.04.07.14.11.3.02.48-.1.18-.14.3-.28.46-.14.16-.3.36-.42.48-.14.14-.28.29-.12.57.16.28.72 1.18 1.54 1.91 1.06.94 1.95 1.23 2.23 1.37.28.14.44.12.6-.07.16-.18.7-.82.88-1.1.18-.28.37-.23.62-.14.25.09 1.6.75 1.88.89.28.14.46.21.53.32.07.12.07.67-.18 1.37Z" />
  </svg>
);

const imgPath = "/images/vehiculos/";

const CarDetailComponent = ({ mode }) => {
  const [car, setCar] = useState(null);
  const { carId } = useParams();

  const reloadCar = async () => {
    try {
      const response = await axios.get(`/api/cars/${carId}`);
      setCar(response.data);
    } catch (error) {
      console.error("Error loading car:", error);
    }
  };

  useEffect(() => {
    reloadCar();
  }, [carId]);

  if (!car) {
    return <LoadingComponent />;
  }

  const whatsappHref = carWhatsappUrl(car);
  const price = `$ ${formatMoney(car.price)}`;

  const clientActions = (
    <>
      <div className="vd-cta">
        <button type="button" className="vd-btn vd-btn-primary" data-bs-toggle="modal" data-bs-target="#compraModal">
          Comprar
        </button>
        <a className="vd-btn vd-btn-wa" href={whatsappHref} target="_blank" rel="noopener noreferrer">
          <WhatsAppGlyph />
          Preguntar por WhatsApp
        </a>
      </div>
      <p className="vd-reassure">
        <span className="material-symbols-outlined" aria-hidden="true">verified_user</span>
        Un asesor te responde por WhatsApp y te acompaña en todo el proceso de compra.
      </p>
      <Link to="/financiamiento" className="vd-finance">
        <span className="material-symbols-outlined" aria-hidden="true">calculate</span>
        <span>
          <strong>¿Quieres financiarlo?</strong>
          <small>Simula tu cuota en financiamiento</small>
        </span>
        <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
      </Link>
      <CompraModalContent car={car.id} />
    </>
  );

  const mobileBar = mode === 'client' ? (
    <div className="vd-bar">
      <div className="vd-bar-price">
        <small>Precio</small>
        <strong>{price}</strong>
      </div>
      <a className="vd-btn vd-btn-wa vd-btn-icon" href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Preguntar por WhatsApp">
        <WhatsAppGlyph />
        <span className="vd-bar-wa-text">WhatsApp</span>
      </a>
      <button type="button" className="vd-btn vd-btn-primary" data-bs-toggle="modal" data-bs-target="#compraModal">
        Comprar
      </button>
    </div>
  ) : null;

  return (
    <VehicleDetailComponent
      vehicle={car}
      mode={mode}
      reloadVehicle={reloadCar}
      imagePath={imgPath}
      apiEndpoint="/api/admin/cars"
      redirectPath="/admin/vitrina/"
      showClientInfo={false}
      mobileBar={mobileBar}
    >
      {mode === 'client' && clientActions}
    </VehicleDetailComponent>
  );
};

export default CarDetailComponent;
