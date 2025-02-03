import React, { useState, useEffect, useMemo, Suspense } from 'react';
import HeroBanner from './HeroBanner';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import SearchIcon from '../../assets/icons/search_icon.svg';

import backgroundImage from '../../assets/images/vehiculos_aereo.webp';


// Lazy-load the mobile vender form
const VenderFormMobile = React.lazy(() => import('./VenderFormMobile'));

function BuscadorMobile() {
  // States for the "comprar" form
  const [activeTab, setActiveTab] = useState('comprar');
  const [tipo, setTipo] = useState("");
  const [marca, setMarca] = useState("");
  const [linea, setLinea] = useState("");
  const [marcaDropdown, setMarcaDropdown] = useState([]);
  const [lineaDropdown, setLineaDropdown] = useState([]);
  const [modeloInput, setModeloInput] = useState("");
  const [modelo, setModelo] = useState("");
  const [price, setPrice] = useState("");
  const [km, setKm] = useState("");

  // States for the "vender" form (if you need to keep them here; they will not be used in the lazy-loaded vender form)
  // (For mobile, we now delegate the vender form to its own component)

  const navigate = useNavigate();
  const cars = useSelector((state) => state.cars.cars);

  // Prefetch all marcas on mount
  useEffect(() => {
    requestIdleCallback(() => {
      axios.get('/api/buscavehiculo/?tipo=all')
        .then(response => setMarcaDropdown(response.data))
        .catch(error => console.error('Error prefetching marcas:', error));
    });
  }, []);
    

  // Memoize sorted options for the "comprar" form
  const sortedMarcaOptions = useMemo(() => {
    return [...marcaDropdown].sort((a, b) => a.marca.localeCompare(b.marca));
  }, [marcaDropdown]);

  const sortedLineaOptions = useMemo(() => {
    return [...lineaDropdown].sort((a, b) => {
      const aText = a.linea + ' ' + (a.version || '');
      const bText = b.linea + ' ' + (b.version || '');
      return aText.localeCompare(bText);
    });
  }, [lineaDropdown]);

  // Handle input changes for the "comprar" form
  function handleInputChange(event) {
    const { name, value } = event.target;
    if (name === 'tipo') {
      setTipo(value);
      setMarca('');
      setLinea('');
      axios
        .get(`/api/buscavehiculo/?tipo=${value}`)
        .then((response) => setMarcaDropdown(response.data))
        .catch((error) => console.error(error));
    }
    if (name === 'marca') {
      setMarca(value);
      setLinea('');
      axios
        .get(`/api/buscavehiculo/?tipo=${tipo}&marca=${value}`)
        .then((response) => setLineaDropdown(response.data))
        .catch((error) => console.error(error));
    }
    if (name === 'linea') {
      setLinea(value);
    }
  }

  // Handle submit for the "comprar" form
  function handleSubmit(event) {
    event.preventDefault();
    const queryParams = new URLSearchParams();
    if (marca) queryParams.set('marca', marca);
    if (linea) queryParams.set('linea', linea);

    // Filter the cars in state based on selected marca and línea
    const matchingCars = cars.filter(
      (car) => car.marca === marca && car.linea === linea
    );
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

  return (
      <div
        className="container-fluid d-block buscaStyle buscador-form-container mt-0 pt-0"
      >
      <div className="buscador-form-overlay"></div>
      <div className="buscador-form-content">
        <div className="row">
          <div className="col-12 text-center mb-4">
            <HeroBanner
              topText="Encuentra tu"
              highlightText="Usado ideal"
              isBanner={true}
            />
          </div>
          <div className="col-12">
            {/* Tab Navigation */}
            <div className="d-flex justify-content-start mb-0">
              <div className="compra-venta-buttons-group w-100" role="group">
                <button
                  className={`btn ${
                    activeTab === 'comprar'
                      ? 'selected-button-form'
                      : 'unselected-button-form'
                  } m-0 p-1`}
                  onClick={() => setActiveTab('comprar')}
                >
                  Comprar carro
                </button>
                <button
                  className={`btn ${
                    activeTab === 'vender'
                      ? 'selected-button-form'
                      : 'unselected-button-form'
                  } m-0 p-1`}
                  onClick={() => setActiveTab('vender')}
                >
                  Vende tu carro
                </button>
              </div>
            </div>

            {/* Conditional Rendering */}
            {activeTab === 'comprar' ? (
              <form className="mobile-busca-form" onSubmit={handleSubmit}>
                <div className="search-form-mobile pt-0 mt-0">
                  {/* Tipo */}
                  <div className="form-group mb-3">
                    <label className="form-label mobile-form-label" htmlFor="tipo">
                      Tipo de Vehículo
                    </label>
                    <select
                      className="form-select"
                      id="tipo"
                      name="tipo"
                      value={tipo}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="AUT">Automovil</option>
                      <option value="CAM">Camioneta</option>
                      <option value="CAMP">Campero</option>
                      <option value="HE">Hibrido</option>
                      <option value="HC">Hibrido de Combustión</option>
                      <option value="HL">Hibrido Ligero</option>
                      <option value="MOTO">Moto</option>
                      <option value="PU">PickUp</option>
                      <option value="SUV">Suv</option>
                      <option value="UTIL">Utilitario</option>
                      <option value="VAN">Van</option>
                    </select>
                  </div>

                  {/* Marca */}
                  <div className="form-group mb-3">
                    <label className="form-label mobile-form-label" htmlFor="marca">
                      Marca
                    </label>
                    <select
                      className="form-select"
                      id="marca"
                      name="marca"
                      value={marca}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccionar marca</option>
                      {tipo &&
                        sortedMarcaOptions.map((m) => (
                          <option key={m.id} value={m.marca}>
                            {m.marca}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Línea */}
                  <div className="form-group mb-3">
                    <label className="form-label mobile-form-label" htmlFor="linea">
                      Línea
                    </label>
                    <select
                      className="form-select"
                      id="linea"
                      name="linea"
                      value={linea}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccionar línea</option>
                      {marca &&
                        sortedLineaOptions.map((l) => {
                          const text = l.linea + ' ' + (l.version || '');
                          return (
                            <option key={l.id} value={text}>
                              {text}
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  {/* Modelo */}
                  <div className="form-group mb-3">
                    <label className="form-label mobile-form-label" htmlFor="modelo">
                      Modelo
                    </label>
                    {modelo === 'otro' ? (
                      <input
                        className="form-control"
                        id="modeloInput"
                        name="modeloInput"
                        value={modeloInput}
                        onChange={(e) => setModeloInput(e.target.value)}
                        placeholder="Ingrese el modelo"
                      />
                    ) : (
                      <select
                        className="form-select"
                        id="modelo"
                        name="modelo"
                        value={modelo}
                        onChange={(e) => setModelo(e.target.value)}
                      >
                        <option value="">Modelo desde</option>
                        <option value="otro">Otro</option>
                      </select>
                    )}
                  </div>

                  {/* Precio */}
                  <div className="form-group mb-3">
                    <label className="form-label mobile-form-label" htmlFor="precio">
                      Precio desde
                    </label>
                    <select
                      className="form-select"
                      id="precio"
                      name="precio"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    >
                      <option value="">Precio hasta</option>
                      <option value="10000000">$10.000.000</option>
                      <option value="20000000">$20.000.000</option>
                      <option value="30000000">$30.000.000</option>
                      <option value="50000000">$50.000.000</option>
                      <option value="70000000">$70.000.000</option>
                      <option value="100000000">$100.000.000</option>
                      <option value="150000000">$150.000.000</option>
                      <option value="200000000">$200.000.000</option>
                      <option value="0">Cualquiera</option>
                    </select>
                  </div>

                  {/* Kilometraje */}
                  <div className="form-group mb-4">
                    <label className="form-label mobile-form-label" htmlFor="kilometraje">
                      Kilometraje máximo
                    </label>
                    <select
                      className="form-select"
                      id="kilometraje"
                      name="kilometraje"
                      value={km}
                      onChange={(e) => setKm(e.target.value)}
                    >
                      <option value="">Seleccionar kilometraje</option>
                      <option value="0">0 km</option>
                      <option value="20000">20.000 km</option>
                      <option value="50000">50.000 km</option>
                      <option value="100000">100.000 km</option>
                      <option value="150000">150.000 km</option>
                      <option value="200000">200.000 km</option>
                    </select>
                  </div>

                  <div className="d-grid gap-2">
                    <button type="submit" className="btn submit-button btn-sm">
                      Buscar{' '}
                      <img
                        className="ps-2"
                        src={SearchIcon}
                        alt="Search Icon"
                        width="28"
                        height="28"
                      />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              // Lazy-loaded vender form for mobile
              <Suspense fallback={<div>Loading...</div>}>
                <VenderFormMobile />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuscadorMobile;
