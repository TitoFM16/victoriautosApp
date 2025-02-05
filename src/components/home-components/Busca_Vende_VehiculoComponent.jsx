import React, { useState, useEffect, useMemo, Suspense } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';

import backGround from '../../assets/images/entrada_marco_blanco_repellado.webp';
import backGroundMobile from '../../assets/images/vehiculos_aereo.webp';
import LoadingComponent from '../shared/loadingComponent';

// Lazy load components
const FormContainer = React.lazy(() => import('./FormContainer'));

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
  const [currentYear] = useState(new Date().getFullYear() + 1);

  const navigate = useNavigate();
  const cars = useSelector(state => state.cars.cars);

  // Add state for background image loading
  const [isMobileImageLoaded, setIsMobileImageLoaded] = useState(true);
  const [isDesktopImageLoaded, setIsDesktopImageLoaded] = useState(true);

  useEffect(() => {
    // Verify preloaded images are in cache
    const checkPreloadedImages = async () => {
      try {
        const mobileImg = new Image();
        const desktopImg = new Image();
        
        mobileImg.src = backGroundMobile;
        desktopImg.src = backGround;

        await Promise.all([
          new Promise(resolve => {
            mobileImg.onload = resolve;
            if (mobileImg.complete) resolve();
          }),
          new Promise(resolve => {
            desktopImg.onload = resolve;
            if (desktopImg.complete) resolve();
          })
        ]);

        setIsMobileImageLoaded(true);
        setIsDesktopImageLoaded(true);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    checkPreloadedImages();
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
      // Only fetch marcas when tipo is selected
      if (value) {
        axios
          .get(`/api/buscavehiculo/?tipo=${value}`)
          .then((response) => setMarcaDropdown(response.data))
          .catch((error) => console.error(error));
      } else {
        setMarcaDropdown([]); // Clear marcas if no tipo selected
      }
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

  const formData = {
    tipo,
    marca,
    linea,
    modelo,
    modeloInput,
    currentYear,
    price,
    km
  };

  return (
    <>
      <div 
        className='container-fluid d-block buscaStyle d-block d-md-none'
        style={{
          backgroundColor: '#f5f5f5',
          backgroundImage: `url(${backGroundMobile})`,
          opacity: isMobileImageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in'
        }}
      >
        <Suspense fallback={<LoadingComponent/>}>
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
      <div 
        className='container-fluid d-block buscaStyle d-none d-md-block'
        style={{
          backgroundColor: '#f5f5f5',
          backgroundImage: `url(${backGround})`,
          opacity: isDesktopImageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in'
        }}
      >
        <Suspense fallback={<LoadingComponent/>}>
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
    </>
  );
}

export default Buscador;
