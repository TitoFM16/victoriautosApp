import { lazy, Suspense, useState } from 'react';
import PropTypes from 'prop-types';
import SearchIcon from '../../assets/icons/search_icon.svg';
import LoadingComponent from '../shared/loadingComponent';

const VenderForm = lazy(() => import('./VenderForm'));

const controlClass = 'home-control';
const labelClass = 'home-label';
const LAST_STEP = 5; // tipo, marca, linea, modelo, precio, kilometraje

// On phones the buscador reveals one field at a time (see .is-pending in
// _home.scss): choosing a value in field N shows field N + 1. Desktop always
// shows all six.

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
    km,
  } = formData;
  const [revealedStep, setRevealedStep] = useState(0);
  const [showAllFields, setShowAllFields] = useState(false);
  const reveal = (step) => setRevealedStep((current) => Math.max(current, step + 1));
  const fieldClass = (step, extra = '') => (
    `home-field ${extra} ${step > revealedStep && !showAllFields ? 'is-pending' : 'is-revealed'}`
  );
  const onCatalogChange = (step) => (event) => {
    handleInputChange(event);
    if (event.target.value) reveal(step);
  };

  return (
    <div className="home-search">
      <div className="home-search__tabs" role="tablist" aria-label="Comprar o vender">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'comprar'}
          className={`home-search__tab ${activeTab === 'comprar' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('comprar')}
        >
          Quiero comprar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'vender'}
          className={`home-search__tab ${activeTab === 'vender' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('vender')}
        >
          Quiero vender
        </button>
      </div>

      <div className="home-search__body">
        <h2 className="home-search__title">
          {activeTab === 'comprar' ? 'Encuentra el indicado' : 'Empecemos por tu vehículo'}
        </h2>

        {activeTab === 'comprar' ? (
          <form className="home-form" onSubmit={handleSubmit}>
            <div className={fieldClass(0)}>
              <label className={labelClass} htmlFor="tipo">Tipo</label>
              <select className={controlClass} id="tipo" name="tipo" value={tipo} onChange={onCatalogChange(0)}>
                <option value="">Todos los tipos</option>
                <option value="AUT">Automóvil</option>
                <option value="CAM">Camioneta</option>
                <option value="CAMP">Campero</option>
                <option value="HE">Híbrido</option>
                <option value="HC">Híbrido de combustión</option>
                <option value="HL">Híbrido ligero</option>
                <option value="MOTO">Moto</option>
                <option value="PU">Pickup</option>
                <option value="SUV">SUV</option>
                <option value="UTIL">Utilitario</option>
                <option value="VAN">Van</option>
              </select>
            </div>

            <div className={fieldClass(1)}>
              <label className={labelClass} htmlFor="marca">Marca</label>
              <select className={controlClass} id="marca" name="marca" value={marca} onChange={onCatalogChange(1)} disabled={!tipo}>
                <option value="">{tipo ? 'Todas las marcas' : 'Elige un tipo primero'}</option>
                {tipo && sortedMarcaOptions.map((option) => (
                  <option key={option.id || option.marca} value={option.marca}>{option.marca}</option>
                ))}
              </select>
            </div>

            <div className={fieldClass(2)}>
              <label className={labelClass} htmlFor="linea">Línea</label>
              <select className={controlClass} id="linea" name="linea" value={linea} onChange={onCatalogChange(2)} disabled={!marca}>
                <option value="">{marca ? 'Todas las líneas' : 'Elige una marca primero'}</option>
                {marca && sortedLineaOptions.map((option) => {
                  const text = `${option.linea} ${option.version || ''}`.trim();
                  return <option key={option.id || text} value={text}>{text}</option>;
                })}
              </select>
            </div>

            <div className={fieldClass(3, 'is-half')}>
              <label className={labelClass} htmlFor="modelo">Modelo desde</label>
              {modelo === 'otro' ? (
                <input
                  className={controlClass}
                  id="modeloInput"
                  name="modeloInput"
                  value={modeloInput}
                  onChange={(event) => { setModeloInput(event.target.value); reveal(3); }}
                  onBlur={(event) => {
                    const value = event.target.value;
                    if (value && (!/^\d{4}$/.test(value) || parseInt(value) < 1920 || parseInt(value) > currentYear)) {
                      alert(`Por favor ingrese un año válido entre 1920 y ${currentYear}`);
                      setModeloInput('');
                    }
                  }}
                  placeholder={`1920–${currentYear}`}
                  inputMode="numeric"
                  maxLength={4}
                />
              ) : (
                <select className={controlClass} id="modelo" name="modelo" value={modelo} onChange={(event) => { setModelo(event.target.value); reveal(3); }}>
                  <option value="">Cualquier modelo</option>
                  {Array.from({ length: currentYear - 2000 + 1 }, (_, index) => currentYear - index).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                  <option value="otro">Anterior a 2000</option>
                </select>
              )}
            </div>

            <div className={fieldClass(4, 'is-half')}>
              <label className={labelClass} htmlFor="precio">Presupuesto máximo</label>
              <select className={controlClass} id="precio" name="precio" value={price} onChange={(event) => { setPrice(event.target.value); reveal(4); }}>
                <option value="">Cualquier precio</option>
                {[...Array(20)].map((_, index) => (
                  <option key={index} value={(index + 1) * 10000000}>${((index + 1) * 10).toLocaleString('es-CO')}.000.000</option>
                ))}
              </select>
            </div>

            <div className={fieldClass(5)}>
              <label className={labelClass} htmlFor="kilometraje">Kilometraje máximo</label>
              <select className={controlClass} id="kilometraje" name="kilometraje" value={km} onChange={(event) => setKm(event.target.value)}>
                <option value="">Cualquier kilometraje</option>
                <option value="0">0 km</option>
                {[...Array(20)].map((_, index) => (
                  <option key={index} value={(index + 1) * 10000}>{((index + 1) * 10).toLocaleString('es-CO')}.000 km</option>
                ))}
              </select>
            </div>

            {revealedStep < LAST_STEP && !showAllFields && (
              <button type="button" className="home-form__more" onClick={() => setShowAllFields(true)}>
                Ver todos los filtros
              </button>
            )}

            <button type="submit" className="home-btn home-btn--primary home-form__submit">
              Buscar vehículos
              <img src={SearchIcon} alt="" className="home-form__submit-icon" />
            </button>
          </form>
        ) : (
          <Suspense fallback={<LoadingComponent />}>
            <VenderForm />
          </Suspense>
        )}
      </div>
    </div>
  );
};

const vehicleOption = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  marca: PropTypes.string,
  linea: PropTypes.string,
  version: PropTypes.string,
});

FormContainer.propTypes = {
  activeTab: PropTypes.oneOf(['comprar', 'vender']).isRequired,
  setActiveTab: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    tipo: PropTypes.string.isRequired,
    marca: PropTypes.string.isRequired,
    linea: PropTypes.string.isRequired,
    modelo: PropTypes.string.isRequired,
    modeloInput: PropTypes.string.isRequired,
    currentYear: PropTypes.number.isRequired,
    price: PropTypes.string.isRequired,
    km: PropTypes.string.isRequired,
  }).isRequired,
  setModeloInput: PropTypes.func.isRequired,
  setModelo: PropTypes.func.isRequired,
  setPrice: PropTypes.func.isRequired,
  setKm: PropTypes.func.isRequired,
  sortedMarcaOptions: PropTypes.arrayOf(vehicleOption).isRequired,
  sortedLineaOptions: PropTypes.arrayOf(vehicleOption).isRequired,
};

export default FormContainer;
