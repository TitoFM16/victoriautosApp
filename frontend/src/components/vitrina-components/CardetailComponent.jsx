import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import whatsappIcon from '../../assets/icons/whatsapp-brands-solid.svg';
import CompraModalContent from './compraModalContent';
import VehicleDetailComponent from '../shared/VehicleDetailComponent';
import LoadingComponent from '../shared/loadingComponent';

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

  const clientActions = (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <button
        type="button"
        className="rounded-xl bg-victoria-red px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-800"
        data-bs-toggle="modal"
        data-bs-target="#compraModal"
      >
        Comprar
      </button>
      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-victoria-dark transition hover:border-victoria-dark"
        onClick={() => window.open(`https://api.whatsapp.com/send?phone=573113178450&text=Hola, estoy interesado en el vehículo ${car.marca} ${car.linea} ${car.modelo}`, "_blank")}
      >
        <img src={whatsappIcon} alt="" className="h-4 w-4" />
        Contactar
      </button>
      <CompraModalContent car={car.id} />
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
