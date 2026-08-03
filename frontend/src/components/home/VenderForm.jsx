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
      alert('Por favor ingrese un año valido' + (new Date().getFullYear() + 1));
      return;
    }

    if (venderKilometraje && !validateKilometraje(venderKilometraje)) {
      alert('Por favor ingrese un kilometraje válido');
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

  const controlClass = 'mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-victoria-dark outline-none transition focus:border-victoria-red focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-zinc-100';
  const labelClass = 'text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500';

  return (
    <form className="mt-7 grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2" onSubmit={handleVenderSubmit}>
        <div>
          <label className={labelClass} htmlFor='venderMarca'>Marca</label>
          <select
            className={controlClass}
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
        <div>
          <label className={labelClass} htmlFor='venderLinea'>Línea</label>
          <select
            className={controlClass}
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
        <div>
          <label className={labelClass} htmlFor='venderModelo'>Modelo</label>
          <input
            type="text"
            className={`${controlClass} ${venderModelo && !validateModelo(venderModelo) ? 'border-red-600' : ''}`}
            id='venderModelo'
            value={venderModelo}
            onChange={handleModeloChange}
            placeholder="Ej: 2020"
          />
          {venderModelo && !validateModelo(venderModelo) && (
            <p className="mt-1 text-xs font-semibold text-red-700" role="alert">
              El año debe estar entre 1920 y {new Date().getFullYear() + 1}
            </p>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor='venderKilometraje'>Kilometraje</label>
          <input
            type="text"
            className={`${controlClass} ${venderKilometraje && !validateKilometraje(venderKilometraje) ? 'border-red-600' : ''}`}
            id='venderKilometraje'
            value={venderKilometraje}
            onChange={handleKilometrajeChange}
            placeholder="Ej: 50000"
          />
          {venderKilometraje && !validateKilometraje(venderKilometraje) && (
            <p className="mt-1 text-xs font-semibold text-red-700" role="alert">
              El kilometraje debe ser menor a 10.000.000
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <button type='submit' className="min-h-13 w-full rounded-xl bg-victoria-red px-6 py-3 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-red-800">
            Completar información
          </button>
        </div>
    </form>
  );
}

export default VenderForm;
