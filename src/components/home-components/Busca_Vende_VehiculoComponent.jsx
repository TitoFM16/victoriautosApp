import React, { useState, useEffect, useMemo, Suspense } from 'react';
import HeroBanner from './HeroBanner';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import SearchIcon from '../../assets/icons/search_icon.svg';

// Lazy load the vender tab component
const VenderForm = React.lazy(() => import('./VenderForm'));

function Buscador() {
  // States for the "comprar" (buy) form
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

  const navigate = useNavigate();
  const cars = useSelector(state => state.cars.cars);

  // Prefetch all marcas on mount
  useEffect(() => {
    requestIdleCallback(() => {
      axios.get('/api/buscavehiculo/?tipo=all')
        .then(response => setMarcaDropdown(response.data))
        .catch(error => console.error('Error prefetching marcas:', error));
    });
  }, []);
    

  // Memoize sorted options for "marca" and "linea" to avoid re-sorting on every render
  const sortedMarcaOptions = useMemo(() => {
    return [...marcaDropdown]
      .filter(item => item && typeof item.marca === 'string')
      .sort((a, b) => {
        const marcaA = a.marca || '';
        const marcaB = b.marca || '';
        return marcaA.localeCompare(marcaB);
      });
  }, [marcaDropdown]);
  

  const sortedLineaOptions = useMemo(() => {
    return [...lineaDropdown].sort((a, b) => {
      const aText = a.linea + ' ' + (a.version || '');
      const bText = b.linea + ' ' + (b.version || '');
      return aText.localeCompare(bText);
    });
  }, [lineaDropdown]);

  // Handle form submission for the "comprar" tab
  function handleSubmit(event) {
    event.preventDefault();

    const queryParams = new URLSearchParams();
    if (marca) queryParams.set('marca', marca);
    if (linea) queryParams.set('linea', linea);

    const matchingCars = cars.filter(car => car.marca === marca && car.linea === linea);
    if (matchingCars.length > 0) {
      // Navigate to "vitrina" with filter parameters if cars are found
      navigate(`/vitrina?${queryParams.toString()}`);
    } else {
      // Otherwise, navigate to "interes" passing the state values
      navigate('/interes', {
        state: {
          tipo,
          marca,
          linea,
          modelo: modelo === 'otro' ? modeloInput : modelo,
          price,
          km
        }
      });
    }
  }

  // Handle input changes for the "comprar" form
  function handleInputChange(event) {
    const { name, value } = event.target;

    if (name === 'tipo') {
      setTipo(value);
      setMarca('');
      setLinea('');
      axios.get(`/api/buscavehiculo/?tipo=${value}`)
        .then(response => setMarcaDropdown(response.data))
        .catch(error => console.error(error));
    }
    if (name === 'marca') {
      setMarca(value);
      setLinea('');
      axios.get(`/api/buscavehiculo/?tipo=${tipo}&marca=${value}`)
        .then(response => setLineaDropdown(response.data))
        .catch(error => console.error(error));
    }
    if (name === 'linea') {
      setLinea(value);
    }
  }

  return (
    <div className='container-fluid d-block buscaStyle'>
      <div className="row">
        <HeroBanner
          topText="Encuentra tu"
          highlightText="Usado ideal"
          isBanner={true}
        />

        <div style={{ position: 'absolute', top: '70%' }}>
          <div className="container">
            {/* Tab Navigation */}
            <div className="d-flex justify-content-start mb-0">
              <div className="compra-venta-buttons-group" role="group">
                <button
                  className={`btn ${activeTab === 'comprar' ? 'selected-button-form' : 'unselected-button-form'}`}
                  onClick={() => setActiveTab('comprar')}
                >
                  Comprar carro
                </button>
                <button
                  className={`btn ${activeTab === 'vender' ? 'selected-button-form' : 'unselected-button-form'}`}
                  onClick={() => setActiveTab('vender')}
                >
                  Vende tu carro
                </button>
              </div>
            </div>

            {/* Conditional Rendering: "comprar" form vs. lazy-loaded "vender" form */}
            {activeTab === 'comprar' ? (
              <form className="container web-busca-form" onSubmit={handleSubmit}>
                <div className='form-group row'>
                  <div className='col-4'>
                    <label className="web-form-label" htmlFor='tipo'>Tipo</label>
                    <select
                      className='form-control'
                      id='tipo'
                      name='tipo'
                      value={tipo}
                      onChange={handleInputChange}
                    >
                      <option value=''>Tipo de vehiculo</option>
                      <option value='AUT'>Automovil</option>
                      <option value='CAM'>Camioneta</option>
                      <option value='CAMP'>Campero</option>
                      <option value='HE'>Hibrido</option>
                      <option value='HC'>Hibrido de Combustión</option>
                      <option value='HL'>Hibrido Ligero</option>
                      <option value='MOTO'>Moto</option>
                      <option value='PU'>PickUp</option>
                      <option value='SUV'>Suv</option>
                      <option value='UTIL'>Utilitario</option>
                      <option value='VAN'>Van</option>
                    </select>
                  </div>
                  <div className='col-4'>
                    <label className="web-form-label" htmlFor='marca'>Marca</label>
                    <select
                      className='form-control'
                      id='marca'
                      name='marca'
                      value={marca}
                      onChange={handleInputChange}
                    >
                      <option value=''>Marca</option>
                      {tipo && sortedMarcaOptions.map(m => (
                        <option key={m.id} value={m.marca}>
                          {m.marca}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='col-4'>
                    <label className="web-form-label" htmlFor='linea'>Linea</label>
                    <select
                      className='form-control'
                      id='linea'
                      name='linea'
                      value={linea}
                      onChange={handleInputChange}
                    >
                      <option value=''>Linea</option>
                      {marca && sortedLineaOptions.map(l => {
                        const text = l.linea + ' ' + (l.version || '');
                        return (
                          <option key={l.id} value={text}>
                            {text}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className='col-4'>
                    <label className="web-form-label" htmlFor='modelo'>Modelo</label>
                    {modelo === 'otro' ? (
                      <input
                        className='form-control'
                        id='modeloInput'
                        name='modeloInput'
                        value={modeloInput}
                        onChange={e => setModeloInput(e.target.value)}
                      />
                    ) : (
                      <select
                        className='form-control'
                        id='modelo'
                        name='modelo'
                        value={modelo}
                        onChange={e => setModelo(e.target.value)}
                      >
                        <option value=''>Modelo desde</option>
                        <option value='otro'>Otro</option>
                      </select>
                    )}
                  </div>
                  <div className='col-4'>
                    <label className="web-form-label" htmlFor='precio'>Precio</label>
                    <select
                      className='form-control'
                      id='precio'
                      name='precio'
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                    >
                      <option value=''>Precio hasta</option>
                      <option value='10000000'>$10.000.000</option>
                      <option value='20000000'>$20.000.000</option>
                      <option value='30000000'>$30.000.000</option>
                      <option value='40000000'>$40.000.000</option>
                      <option value='50000000'>$50.000.000</option>
                      <option value='60000000'>$60.000.000</option>
                      <option value='70000000'>$70.000.000</option>
                      <option value='80000000'>$80.000.000</option>
                      <option value='90000000'>$90.000.000</option>
                      <option value='100000000'>$100.000.000</option>
                      <option value='110000000'>$110.000.000</option>
                      <option value='120000000'>$120.000.000</option>
                      <option value='130000000'>$130.000.000</option>
                      <option value='140000000'>$140.000.000</option>
                      <option value='150000000'>$150.000.000</option>
                      <option value='160000000'>$160.000.000</option>
                      <option value='170000000'>$170.000.000</option>
                      <option value='180000000'>$180.000.000</option>
                      <option value='190000000'>$190.000.000</option>
                      <option value='200000000'>$200.000.000</option>
                      <option value='0'>Cualquiera</option>
                    </select>
                  </div>
                  <div className='col-4'>
                    <label className="web-form-label" htmlFor='kilometraje'>Kilometraje</label>
                    <select
                      className='form-control'
                      id='kilometraje'
                      name='kilometraje'
                      value={km}
                      onChange={e => setKm(e.target.value)}
                    >
                      <option value=''>Kilometraje máximo</option>
                      <option value='0'>0</option>
                      <option value='10000'>10.000 km</option>
                      <option value='20000'>20.000 km</option>
                      <option value='30000'>30.000 km</option>
                      <option value='40000'>40.000 km</option>
                      <option value='50000'>50.000 km</option>
                      <option value='60000'>60.000 km</option>
                      <option value='70000'>70.000 km</option>
                      <option value='80000'>80.000 km</option>
                      <option value='90000'>90.000 km</option>
                      <option value='100000'>100.000 km</option>
                      <option value='110000'>110.000 km</option>
                      <option value='120000'>120.000 km</option>
                      <option value='130000'>130.000 km</option>
                      <option value='140000'>140.000 km</option>
                      <option value='150000'>150.000 km</option>
                      <option value='160000'>160.000 km</option>
                      <option value='170000'>170.000 km</option>
                      <option value='180000'>180.000 km</option>
                      <option value='190000'>190.000 km</option>
                      <option value='200000'>200.000 km</option>
                    </select>
                  </div>
                  <div className='col-12 d-flex justify-content-center align-items-center py-3'>
                    <button type='submit' className='btn btn-sm submit-button'>
                      Buscar <img className="ps-1" src={SearchIcon} alt="Search Icon" width="28" height="28" />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              // Lazy-loaded vender form wrapped with Suspense
              <Suspense fallback={<div>Loading...</div>}>
                <VenderForm />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Buscador;
