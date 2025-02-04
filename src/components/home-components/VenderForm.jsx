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
            className='form-control'
            id='venderModelo'
            value={venderModelo}
            onChange={(e) => setVenderModelo(e.target.value)}
            placeholder="Ingrese el modelo"
          />
        </div>
        <div className='col-12 col-md-6'>
          <label className="web-form-label" htmlFor='venderKilometraje'>Kilometraje</label>
          <input
            type="number"
            className='form-control'
            id='venderKilometraje'
            value={venderKilometraje}
            onChange={(e) => setVenderKilometraje(e.target.value)}
            placeholder="0 km"
          />
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
