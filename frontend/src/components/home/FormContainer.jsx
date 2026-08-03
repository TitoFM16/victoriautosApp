import React, { Suspense } from 'react';
import SearchIcon from '../../assets/icons/search_icon.svg';
import HeroBanner from './HeroBanner';

const VenderForm = React.lazy(() => import('./VenderForm'));

const FormContainer = ({
  activeTab,
  setActiveTab,
  handleSubmit,
  handleInputChange,
  formData,
  setModeloInput,
  setModelo,
  setPrice,
  setKm,
  sortedMarcaOptions,
  sortedLineaOptions,
  
}) => {
  const {
    tipo,
    marca,
    linea,
    modelo,
    modeloInput,
    currentYear,
    price,
    km
  } = formData;

  return (
    <div className="row busca-hero-banner">
    <HeroBanner
      topText="Encuentra tu"
      highlightText="Usado ideal"
      
    />
    <div className='compra-venta-container'>
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
              {/* Tipo Select */}
              <div className='col-12 col-md-4'>
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

              {/* Marca Select */}
              <div className='col-12 col-md-4'>
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

              {/* Linea Select */}
              <div className='col-12 col-md-4'>
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

              {/* Modelo Input/Select */}
              <div className='col-12 col-md-4'>
                <label className="web-form-label" htmlFor='modelo'>Modelo</label>
                {modelo === 'otro' ? (
                  <input
                    className='form-control'
                    id='modeloInput'
                    name='modeloInput'
                    value={modeloInput}
                    onChange={(e) => setModeloInput(e.target.value)}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value && (!/^\d{4}$/.test(value) || 
                          parseInt(value) < 1920 || 
                          parseInt(value) > currentYear)) {
                        alert(`Por favor ingrese un año válido entre 1920 y ${currentYear}`);
                        setModeloInput('');
                      }
                    }}
                    placeholder={`Ingrese el modelo (1920-${currentYear})`}
                    maxLength={4}
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
                    {Array.from({length: currentYear - 2000 + 1}, (_, i) => currentYear - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                    <option value='otro'>Otro</option>
                  </select>
                )}
              </div>

              {/* Precio Select */}
              <div className='col-12 col-md-4'>
                <label className="web-form-label" htmlFor='precio'>Precio</label>
                <select
                  className='form-control'
                  id='precio'
                  name='precio'
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                >
                  <option value=''>Precio hasta</option>
                  {[...Array(20)].map((_, i) => (
                    <option key={i} value={(i + 1) * 10000000}>
                      ${((i + 1) * 10).toLocaleString('es-CO')}.000.000
                    </option>
                  ))}
                  <option value='0'>Cualquiera</option>
                </select>
              </div>

              {/* Kilometraje Select */}
              <div className='col-12 col-md-4'>
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
                  {[...Array(20)].map((_, i) => (
                    <option key={i} value={(i + 1) * 10000}>
                      {((i + 1) * 10).toLocaleString('es-CO')}.000 km
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className='col-12 d-flex justify-content-center align-items-center py-3'>
                <button type='submit' className='btn btn-sm submit-button'>
                  Buscar <img className="ps-1" src={SearchIcon} alt="Search Icon" width="28" height="28" />
                </button>
              </div>
            </div>
          </form>
        ) : (
          <Suspense fallback={<div>Loading...</div>}>
            <VenderForm />
          </Suspense>
        )}
      </div>
    </div>
    </div>
  );
};

export default FormContainer; 