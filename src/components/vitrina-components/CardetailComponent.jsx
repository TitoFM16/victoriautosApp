import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import whatsappIcon from '../../assets/icons/whatsapp-brands-solid.svg';
import CompraModalContent from './compraModalContent';
import VehicleDetailComponent from '../shared/VehicleDetailComponent';

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
    return <h3>Loading...</h3>;
  }

  const clientActions = (
    <div className="row py-4">
      <div className="col-6">
        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#compraModal">
          Comprar
        </button>
      </div>
      <div className="col-6">
        <button
          type="button"
          className="btn btn-success btn-block"
          onClick={() => window.open(`https://api.whatsapp.com/send?phone=573113178450&text=Hola, estoy interesado en el vehículo ${car.marca} ${car.linea} ${car.modelo}`, "_blank")}
        >
          <img src={whatsappIcon} alt="whatsapp" style={{ height: 20, width: 20 }} className="whatsapp-icon" />
          Contactar
        </button>
      </div>
      <CompraModalContent car={car._id} />
    </div>
  );

  return (
    <VehicleDetailComponent
      vehicle={car}
      mode={mode}
      reloadVehicle={reloadCar}
      imagePath={imgPath}
      apiEndpoint="/api/admin/cars"
      redirectPath="/admin/vitrina/"
      showClientInfo={false}
    >
      {mode === 'client' && clientActions}
    </VehicleDetailComponent>
  );
};

export default CarDetailComponent;
