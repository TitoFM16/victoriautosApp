import React, { useState, useEffect, useMemo, Suspense } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';

import backGround from '../../assets/images/entrada_marco_blanco_repellado.webp';
import LoadingComponent from '../shared/loadingComponent';

import audiLogo from '../../assets/icons/brands/audi-svgrepo-com.svg';
import bmwLogo from '../../assets/icons/brands/bmw-svgrepo-com.svg';
import chevroletLogo from '../../assets/icons/brands/chevrolet-svgrepo-com.svg';
import dodgeLogo from '../../assets/icons/brands/dodge-ram-logo-svgrepo-com.svg';
import fordLogo from '../../assets/icons/brands/ford-svgrepo-com.svg';
import hondaLogo from '../../assets/icons/brands/honda-svgrepo-com.svg';
import hyundaiLogo from '../../assets/icons/brands/hyundai-svgrepo-com.svg';
import jeepLogo from '../../assets/icons/brands/jeep-alt-svgrepo-com.svg';
import kiaLogo from '../../assets/icons/brands/kia-svgrepo-com.svg';
import landroverLogo from '../../assets/icons/brands/landrover-svgrepo-com.svg';
import lexusLogo from '../../assets/icons/brands/lexus-svgrepo-com.svg';
import mazdaLogo from '../../assets/icons/brands/mazda-svgrepo-com.svg';
import mercedesLogo from '../../assets/icons/brands/mercedes-benz-logo-svgrepo-com.svg';
import mitsubishiLogo from '../../assets/icons/brands/mitsubishi-svgrepo-com.svg';
import nissanLogo from '../../assets/icons/brands/nissan-svgrepo-com.svg';
import renaultLogo from '../../assets/icons/brands/renault-svgrepo-com.svg';
import subaruLogo from '../../assets/icons/brands/subaru-alt-svgrepo-com.svg';
import suzukiLogo from '../../assets/icons/brands/suzuki-svgrepo-com.svg';
import toyotaLogo from '../../assets/icons/brands/toyota-svgrepo-com.svg';
import volkswagenLogo from '../../assets/icons/brands/volkswagen-svgrepo-com.svg';
import volvoLogo from '../../assets/icons/brands/volvo-svgrepo-com.svg';

// Lazy load components
import FormContainer from './FormContainer';

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

  const brandLogos = [
    audiLogo, bmwLogo, chevroletLogo, dodgeLogo, fordLogo, hondaLogo,
    hyundaiLogo, jeepLogo, kiaLogo, landroverLogo, lexusLogo, mazdaLogo,
    mercedesLogo, mitsubishiLogo, nissanLogo, renaultLogo, subaruLogo,
    suzukiLogo, toyotaLogo, volkswagenLogo, volvoLogo
  ];

  useEffect(() => {
    // Verify preloaded images are in cache
    const checkPreloadedImages = async () => {
      try {
        const desktopImg = new Image();
        

        desktopImg.src = backGround;

        await Promise.all([
          new Promise(resolve => {
            desktopImg.onload = resolve;
            if (desktopImg.complete) resolve();
          })
        ]);

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
          background: 'linear-gradient(to bottom, #f5f5f5 90%, #ffffff)',
          position: 'relative',
          opacity: isMobileImageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in'
        }}
      >
        <div className="brand-logo-background">
          {[...Array(4)].map((_, i) => (
            brandLogos.map((logo, index) => (
              <img 
                key={`${i}-${index}`} 
                src={logo} 
                alt="brand logo" 
                loading="lazy"
                width="100px"
                height="100px"
              />
            ))
          ))}
        </div>
        <div className="form-container">
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
      </div>
      <div 
  className='container-fluid d-block buscaStyle d-none d-md-block'
  style={{
    background: 'linear-gradient(to bottom, #f5f5f5 90%, #ffffff)',
    position: 'relative',
    opacity: isDesktopImageLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in'
  }}
>
  <div className="brand-logo-background-desktop">
    {[...Array(4)].map((_, i) => (
      brandLogos.map((logo, index) => (
        <img 
          key={`desktop-${i}-${index}`} 
          src={logo} 
          alt="brand logo" 
          loading="lazy"
          width="100px"
          height="100px"
        />
      ))
    ))}
  </div>

  <div className="form-container">
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
</div>

    </>
  );
}

export default Buscador;
