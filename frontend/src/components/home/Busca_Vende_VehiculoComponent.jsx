import { Suspense, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';

import dealershipImage from '../../assets/images/entrada_marco_blanco_repellado.webp';
import audiLogo from '../../assets/icons/brands/audi-svgrepo-com.svg';
import bmwLogo from '../../assets/icons/brands/bmw-svgrepo-com.svg';
import chevroletLogo from '../../assets/icons/brands/chevrolet-svgrepo-com.svg';
import fordLogo from '../../assets/icons/brands/ford-svgrepo-com.svg';
import hondaLogo from '../../assets/icons/brands/honda-svgrepo-com.svg';
import mazdaLogo from '../../assets/icons/brands/mazda-svgrepo-com.svg';
import mercedesLogo from '../../assets/icons/brands/mercedes-benz-logo-svgrepo-com.svg';
import toyotaLogo from '../../assets/icons/brands/toyota-svgrepo-com.svg';
import volkswagenLogo from '../../assets/icons/brands/volkswagen-svgrepo-com.svg';
import LoadingComponent from '../shared/loadingComponent';
import FormContainer from './FormContainer';

const mobileBrandLogos = [
  audiLogo,
  bmwLogo,
  chevroletLogo,
  fordLogo,
  hondaLogo,
  mazdaLogo,
  mercedesLogo,
  toyotaLogo,
  volkswagenLogo,
];

function Buscador() {
  const [activeTab, setActiveTab] = useState('comprar');
  const [tipo, setTipo] = useState('');
  const [marca, setMarca] = useState('');
  const [linea, setLinea] = useState('');
  const [marcaDropdown, setMarcaDropdown] = useState([]);
  const [lineaDropdown, setLineaDropdown] = useState([]);
  const [modeloInput, setModeloInput] = useState('');
  const [modelo, setModelo] = useState('');
  const [price, setPrice] = useState('');
  const [km, setKm] = useState('');
  const [currentYear] = useState(new Date().getFullYear() + 1);

  const navigate = useNavigate();
  const cars = useSelector((state) => state.cars.cars);

  const sortedMarcaOptions = useMemo(
    () => [...marcaDropdown]
      .filter((item) => item && typeof item.marca === 'string')
      .sort((a, b) => a.marca.localeCompare(b.marca)),
    [marcaDropdown],
  );

  const sortedLineaOptions = useMemo(
    () => [...lineaDropdown].sort((a, b) => {
      const aText = `${a.linea} ${a.version || ''}`;
      const bText = `${b.linea} ${b.version || ''}`;
      return aText.localeCompare(bText);
    }),
    [lineaDropdown],
  );

  function handleSubmit(event) {
    event.preventDefault();

    const queryParams = new URLSearchParams();
    if (marca) queryParams.set('marca', marca);
    if (linea) queryParams.set('linea', linea);

    const matchingCars = cars.filter((car) => car.marca === marca && car.linea === linea);
    if (matchingCars.length > 0) {
      navigate(`/vitrina?${queryParams.toString()}`);
    } else {
      navigate('/interes', {
        state: {
          tipo,
          marca,
          linea,
          modelo: modelo === 'otro' ? modeloInput : modelo,
          price,
          km,
        },
      });
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    if (name === 'tipo') {
      setTipo(value);
      setMarca('');
      setLinea('');
      setLineaDropdown([]);
      if (value) {
        axios
          .get(`/api/buscavehiculo/?tipo=${value}`)
          .then((response) => setMarcaDropdown(response.data))
          .catch((error) => console.error(error));
      } else {
        setMarcaDropdown([]);
      }
    }

    if (name === 'marca') {
      setMarca(value);
      setLinea('');
      if (value) {
        axios
          .get(`/api/buscavehiculo/?tipo=${tipo}&marca=${value}`)
          .then((response) => setLineaDropdown(response.data))
          .catch((error) => console.error(error));
      } else {
        setLineaDropdown([]);
      }
    }

    if (name === 'linea') setLinea(value);
  }

  const formData = {
    tipo,
    marca,
    linea,
    modelo,
    modeloInput,
    currentYear,
    price,
    km,
  };

  return (
    <section className="relative isolate overflow-hidden bg-victoria-dark text-white">
      <img
        src={dealershipImage}
        alt="Sala de ventas Victoriautos sobre la Avenida Panamericana en Pasto"
        className="absolute inset-0 -z-20 hidden h-full w-full object-cover object-[62%_center] sm:block"
        loading="eager"
      />
      <div className="absolute inset-x-0 top-0 -z-20 grid h-[720px] grid-cols-3 bg-[#17191b] sm:hidden" aria-hidden="true">
        {mobileBrandLogos.map((logo, index) => (
          <div key={logo} className="grid place-items-center border-b border-r border-white/5 p-7">
            <img
              src={logo}
              alt=""
              className={`max-h-16 w-full max-w-20 opacity-[0.14] grayscale brightness-0 invert ${index % 2 === 0 ? 'scale-90' : ''}`}
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(13,15,17,.7)_0%,rgba(13,15,17,.96)_31%,rgba(13,15,17,.7)_100%)] sm:bg-[linear-gradient(90deg,rgba(13,15,17,.97)_0%,rgba(13,15,17,.87)_42%,rgba(13,15,17,.35)_100%)]" />

      <div className="mx-auto grid min-h-[720px] max-w-[1400px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,.75fr)] lg:py-20">
        <div className="max-w-3xl pt-2 lg:pr-8">
          <p className="mb-7 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.28em] text-white/75 before:h-px before:w-9 before:bg-victoria-red">
            Consignataria en Pasto, Nariño
          </p>
          <h1 className="max-w-[760px] !text-5xl font-black leading-[0.9] tracking-[-0.06em] text-white sm:!text-7xl xl:!text-[5.75rem]">
            El carro que sigue en tu historia.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
            Compra o vende con acompañamiento local, información clara y una selección de vehículos que sí vale la pena conocer.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/20 pt-6 text-sm font-bold text-white/85">
            <span>Inspección y respaldo</span>
            <span>Negociación transparente</span>
            <span>Opciones de financiación</span>
          </div>
        </div>

        <Suspense fallback={<LoadingComponent />}>
          <FormContainer
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleSubmit={handleSubmit}
            handleInputChange={handleInputChange}
            formData={formData}
            setModeloInput={setModeloInput}
            setModelo={setModelo}
            setPrice={setPrice}
            setKm={setKm}
            sortedMarcaOptions={sortedMarcaOptions}
            sortedLineaOptions={sortedLineaOptions}
          />
        </Suspense>
      </div>
    </section>
  );
}

export default Buscador;
