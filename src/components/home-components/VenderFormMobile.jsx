import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useVehicleDropdowns } from '../../hooks/useVehicleDropdowns';

function VenderFormMobile() {
  const [venderMarca, setVenderMarca] = useState("");
  const [venderLinea, setVenderLinea] = useState("");
  const [venderModelo, setVenderModelo] = useState("");
  const [venderKilometraje, setVenderKilometraje] = useState("");
  const navigate = useNavigate();

  // Get dropdown data from the custom hook
  const { marcaDropdown: hookMarcaDropdown, lineaDropdown: hookLineaDropdown, fetchLineas } = useVehicleDropdowns();

  // Memoize sorted dropdown options
  const sortedHookMarcaOptions = useMemo(() => {
    return Array.isArray(hookMarcaDropdown)
      ? [...hookMarcaDropdown].sort((a, b) => a.marca.localeCompare(b.marca))
      : [];
  }, [hookMarcaDropdown]);

  const sortedHookLineaOptions = useMemo(() => {
    return Array.isArray(hookLineaDropdown)
      ? [...hookLineaDropdown].sort((a, b) => {
          const aText = a.linea + ' ' + (a.version || '');
          const bText = b.linea + ' ' + (b.version || '');
          return aText.localeCompare(bText);
        })
      : [];
  }, [hookLineaDropdown]);

  function handleVenderSubmit(event) {
    event.preventDefault();
    navigate('/vende', {
      state: {
        marca: venderMarca,
        linea: venderLinea,
        modelo: venderModelo,
        km: venderKilometraje,
      },
    });
  }

  return (
    <form className="mobile-busca-form" onSubmit={handleVenderSubmit}>
      <div className="form-group mb-3">
        <label className="form-label mobile-form-label" htmlFor="venderMarca">
          Marca
        </label>
        <select
          className="form-select"
          id="venderMarca"
          value={venderMarca}
          onChange={(e) => {
            setVenderMarca(e.target.value);
            fetchLineas(e.target.value);
          }}
        >
          <option value="">Marca</option>
          {sortedHookMarcaOptions.map((marca) => (
            <option key={marca.id} value={marca.marca}>
              {marca.marca}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group mb-3">
        <label className="form-label mobile-form-label" htmlFor="venderLinea">
          Línea
        </label>
        <select
          className="form-select"
          id="venderLinea"
          value={venderLinea}
          onChange={(e) => setVenderLinea(e.target.value)}
          disabled={!venderMarca}
        >
          <option value="">Seleccione una línea</option>
          {sortedHookLineaOptions.map((linea) => {
            const text = linea.linea + ' ' + (linea.version || '');
            return (
              <option key={linea.id} value={text}>
                {text}
              </option>
            );
          })}
        </select>
      </div>

      <div className="form-group mb-3">
        <label className="form-label mobile-form-label" htmlFor="venderModelo">
          Modelo
        </label>
        <input
          type="text"
          className="form-control"
          id="venderModelo"
          value={venderModelo}
          onChange={(e) => setVenderModelo(e.target.value)}
          placeholder="Ingrese el modelo"
        />
      </div>

      <div className="form-group mb-3">
        <label className="form-label mobile-form-label" htmlFor="venderKilometraje">
          Kilometraje
        </label>
        <input
          type="number"
          className="form-control"
          id="venderKilometraje"
          value={venderKilometraje}
          onChange={(e) => setVenderKilometraje(e.target.value)}
          placeholder="0 km"
        />
      </div>

      <div className="d-grid gap-2">
        <button type="submit" className="btn submit-button btn-sm">
          Completar información
        </button>
      </div>
    </form>
  );
}

export default VenderFormMobile;
