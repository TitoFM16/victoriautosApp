import { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import SearchIcon from '../../assets/icons/search_icon.svg';
import LoadingComponent from '../shared/loadingComponent';

const VenderForm = lazy(() => import('./VenderForm'));

const controlClass = 'mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-victoria-dark outline-none transition focus:border-victoria-red focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-zinc-100';
const labelClass = 'text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500';

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

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/20 border-t-4 border-t-victoria-red bg-white text-victoria-dark shadow-[0_30px_90px_rgba(0,0,0,.35)] sm:rounded-[1.75rem]">
      <div className="grid grid-cols-2 border-b border-zinc-200" role="tablist" aria-label="Comprar o vender">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'comprar'}
          className={`min-h-14 px-4 text-sm font-black transition ${activeTab === 'comprar' ? 'bg-victoria-red text-white' : 'bg-zinc-50 text-zinc-500 hover:text-victoria-dark'}`}
          onClick={() => setActiveTab('comprar')}
        >
          Quiero comprar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'vender'}
          className={`min-h-14 px-4 text-sm font-black transition ${activeTab === 'vender' ? 'bg-victoria-red text-white' : 'bg-zinc-50 text-zinc-500 hover:text-victoria-dark'}`}
          onClick={() => setActiveTab('vender')}
        >
          Quiero vender
        </button>
      </div>

      <div className="p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-victoria-red">
          {activeTab === 'comprar' ? 'Explora el inventario' : 'Conoce el valor de tu usado'}
        </p>
        <h2 className="mt-2 !text-2xl font-black tracking-[-0.035em] sm:!text-3xl">
          {activeTab === 'comprar' ? 'Encuentra el indicado.' : 'Empecemos por tu vehículo.'}
        </h2>

        {activeTab === 'comprar' ? (
          <form className="mt-7 grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div>
              <label className={labelClass} htmlFor="tipo">Tipo</label>
              <select className={controlClass} id="tipo" name="tipo" value={tipo} onChange={handleInputChange}>
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

            <div>
              <label className={labelClass} htmlFor="marca">Marca</label>
              <select className={controlClass} id="marca" name="marca" value={marca} onChange={handleInputChange} disabled={!tipo}>
                <option value="">{tipo ? 'Todas las marcas' : 'Elige un tipo primero'}</option>
                {tipo && sortedMarcaOptions.map((option) => (
                  <option key={option.id} value={option.marca}>{option.marca}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="linea">Línea</label>
              <select className={controlClass} id="linea" name="linea" value={linea} onChange={handleInputChange} disabled={!marca}>
                <option value="">{marca ? 'Todas las líneas' : 'Elige una marca primero'}</option>
                {marca && sortedLineaOptions.map((option) => {
                  const text = `${option.linea} ${option.version || ''}`.trim();
                  return <option key={option.id} value={text}>{text}</option>;
                })}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="modelo">Modelo desde</label>
              {modelo === 'otro' ? (
                <input
                  className={controlClass}
                  id="modeloInput"
                  name="modeloInput"
                  value={modeloInput}
                  onChange={(event) => setModeloInput(event.target.value)}
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
                <select className={controlClass} id="modelo" name="modelo" value={modelo} onChange={(event) => setModelo(event.target.value)}>
                  <option value="">Cualquier modelo</option>
                  {Array.from({ length: currentYear - 2000 + 1 }, (_, index) => currentYear - index).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                  <option value="otro">Anterior a 2000</option>
                </select>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="precio">Presupuesto máximo</label>
              <select className={controlClass} id="precio" name="precio" value={price} onChange={(event) => setPrice(event.target.value)}>
                <option value="">Cualquier precio</option>
                {[...Array(20)].map((_, index) => (
                  <option key={index} value={(index + 1) * 10000000}>${((index + 1) * 10).toLocaleString('es-CO')}.000.000</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="kilometraje">Kilometraje máximo</label>
              <select className={controlClass} id="kilometraje" name="kilometraje" value={km} onChange={(event) => setKm(event.target.value)}>
                <option value="">Cualquier kilometraje</option>
                <option value="0">0 km</option>
                {[...Array(20)].map((_, index) => (
                  <option key={index} value={(index + 1) * 10000}>{((index + 1) * 10).toLocaleString('es-CO')}.000 km</option>
                ))}
              </select>
            </div>

            <button type="submit" className="mt-1 flex min-h-13 items-center justify-center gap-3 rounded-xl bg-victoria-red px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-800 sm:col-span-2">
              Buscar vehículos
              <img src={SearchIcon} alt="" className="h-5 w-5" />
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
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
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
