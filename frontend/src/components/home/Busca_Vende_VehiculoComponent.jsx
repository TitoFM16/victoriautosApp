import { Suspense, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';

import dealershipImage from '../../assets/images/entrada_marco_blanco_repellado.webp';
import LoadingComponent from '../shared/loadingComponent';
import FormContainer from './FormContainer';

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

  const inventoryBrandOptions = (selectedType) => [...new Set(
    cars
      .filter((car) => !selectedType || car.tipo === selectedType)
      .map((car) => car.marca)
      .filter(Boolean),
  )].map((brand) => ({ id: `inventory-${selectedType}-${brand}`, marca: brand }));

  const inventoryLineOptions = (selectedType, selectedBrand) => [...new Set(
    cars
      .filter((car) => (!selectedType || car.tipo === selectedType) && car.marca === selectedBrand)
      .map((car) => car.linea)
      .filter(Boolean),
  )].map((line) => ({ id: `inventory-${selectedBrand}-${line}`, linea: line, version: '' }));

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

    const matchingCars = cars.filter((car) => (
      (!tipo || car.tipo === tipo) &&
      (!marca || car.marca === marca) &&
      (!linea || car.linea === linea)
    ));
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
          .then((response) => {
            const catalogOptions = Array.isArray(response.data) ? response.data : [];
            setMarcaDropdown(catalogOptions.length > 0 ? catalogOptions : inventoryBrandOptions(value));
          })
          .catch(() => setMarcaDropdown(inventoryBrandOptions(value)));
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
          .then((response) => {
            const catalogOptions = Array.isArray(response.data) ? response.data : [];
            setLineaDropdown(catalogOptions.length > 0 ? catalogOptions : inventoryLineOptions(tipo, value));
          })
          .catch(() => setLineaDropdown(inventoryLineOptions(tipo, value)));
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
    <section className="home-hero" aria-labelledby="home-hero-title">
      <img
        src={dealershipImage}
        alt="Sala de ventas Victoriautos sobre la Avenida Panamericana en Pasto"
        className="home-hero__image"
        width="1600"
        height="900"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
      <div className="home-hero__overlay" aria-hidden="true" />

      <div className="home-hero__inner">
        <div className="home-hero__copy">
          <p className="home-eyebrow home-eyebrow--light">Consignataria en Pasto, Nariño</p>
          <h1 id="home-hero-title" className="home-hero__title">
            El carro que sigue en tu historia.
          </h1>
          <p className="home-hero__subline">
            Compra o vende con acompañamiento local, información clara y vehículos que sí vale la pena conocer.
          </p>
          <ul className="home-hero__chips">
            {[
              ['verified_user', 'Inspección y respaldo'],
              ['handshake', 'Negociación transparente'],
              ['payments', 'Opciones de financiación'],
            ].map(([icon, label]) => (
              <li key={label}>
                <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
                {label}
              </li>
            ))}
          </ul>
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
