import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useVehicleDropdowns } from '../../hooks/useVehicleDropdowns';

function VenderForm() {
  // Local states for the "vender" (sell) form
  const [venderMarca, setVenderMarca] = useState("");
  const [venderLinea, setVenderLinea] = useState("");
  const [venderModelo, setVenderModelo] = useState("");
  const [venderKilometraje, setVenderKilometraje] = useState("");
  const navigate = useNavigate();

  // Use the custom hook for dropdowns in the vender form
  const { marcaDropdown: hookMarcaDropdown, lineaDropdown: hookLineaDropdown, fetchLineas } = useVehicleDropdowns();

  // Validation functions
  const validateModelo = (value) => {
    const currentYear = new Date().getFullYear();
    const year = parseInt(value);
    return year >= 1920 && year <= currentYear + 1;
  };

  const validateKilometraje = (value) => {
    const km = parseInt(value.replace(/\D/g, ''));
    return !isNaN(km) && km >= 0 && km < 10000000;
  };

  // Input handlers with validation
  const handleModeloChange = (e) => {
    // Only allow numbers and limit to 4 digits
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 4);
    setVenderModelo(numericValue);
  };

  const handleKilometrajeChange = (e) => {
    // Only allow numbers and limit to 7 digits
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 7);
    setVenderKilometraje(numericValue);
  };

  // Memoize sorted options from the hook dropdowns
  const sortedHookMarcaOptions = hookMarcaDropdown && Array.isArray(hookMarcaDropdown)
    ? [...hookMarcaDropdown].sort((a, b) => a.marca.localeCompare(b.marca))
    : [];

  const sortedHookLineaOptions = hookLineaDropdown && Array.isArray(hookLineaDropdown)
    ? [...hookLineaDropdown].sort((a, b) => {
        const aText = a.linea + ' ' + (a.version || '');
        const bText = b.linea + ' ' + (b.version || '');
        return aText.localeCompare(bText);
      })
    : [];

  function handleVenderSubmit(event) {
    event.preventDefault();
    
    // Validate before submitting
    if (venderModelo && !validateModelo(venderModelo)) {
      alert('Por favor ingrese un año válido entre 1920 y ' + (new Date().getFullYear() + 1));
      return;
    }

    if (venderKilometraje && !validateKilometraje(venderKilometraje)) {
      alert('Por favor ingrese un kilometraje válido menor a 10.000.000');
      return;
    }

    navigate('/vende', {
      state: {
        marca: venderMarca,
        linea: venderLinea,
        modelo: venderModelo,
        km: venderKilometraje
      }
    });
  }

  return (
    <form className="container web-busca-form" onSubmit={handleVenderSubmit}>
      <div className='form-group row'>
        <div className='col-12 col-md-6'>
          <label className="web-form-label" htmlFor='venderMarca'>Marca</label>
          <select
            className='form-control'
            id='venderMarca'
            value={venderMarca}
            onChange={(e) => {
              setVenderMarca(e.target.value);
              fetchLineas(e.target.value);
            }}
          >
            <option value=''>Marca</option>
            {sortedHookMarcaOptions.map(marca => (
              <option key={marca.id} value={marca.marca}>
                {marca.marca}
              </option>
            ))}
          </select>
        </div>
        <div className='col-12 col-md-6'>
          <label className="web-form-label" htmlFor='venderLinea'>Línea</label>
          <select
            className='form-control'
            id='venderLinea'
            value={venderLinea}
            onChange={(e) => setVenderLinea(e.target.value)}
            disabled={!venderMarca}
          >
            <option value=''>Seleccione una linea</option>
            {sortedHookLineaOptions.map(linea => {
              const text = linea.linea + ' ' + (linea.version || '');
              return (
                <option key={linea.id} value={text}>
                  {text}
                </option>
              );
            })}
          </select>
        </div>
        <div className='col-12 col-md-6'>
          <label className="web-form-label" htmlFor='venderModelo'>Modelo</label>
          <input
            type="text"
            className={`form-control ${venderModelo && !validateModelo(venderModelo) ? 'is-invalid' : ''}`}
            id='venderModelo'
            value={venderModelo}
            onChange={handleModeloChange}
            placeholder="Ej: 2020"
          />
          {venderModelo && !validateModelo(venderModelo) && (
            <div className="invalid-feedback">
              El año debe estar entre 1920 y {new Date().getFullYear() + 1}
            </div>
          )}
        </div>
        <div className='col-12 col-md-6'>
          <label className="web-form-label" htmlFor='venderKilometraje'>Kilometraje</label>
          <input
            type="text"
            className={`form-control ${venderKilometraje && !validateKilometraje(venderKilometraje) ? 'is-invalid' : ''}`}
            id='venderKilometraje'
            value={venderKilometraje}
            onChange={handleKilometrajeChange}
            placeholder="Ej: 50000"
          />
          {venderKilometraje && !validateKilometraje(venderKilometraje) && (
            <div className="invalid-feedback">
              El kilometraje debe ser menor a 10.000.000
            </div>
          )}
        </div>
        <div className='col-12 d-flex justify-content-center align-items-center py-3'>
          <button type='submit' className='btn btn-sm submit-button'>
            Completar información
          </button>
        </div>
      </div>
    </form>
  );
}

export default VenderForm;
