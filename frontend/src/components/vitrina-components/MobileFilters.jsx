import { useEffect } from 'react';
import PropTypes from 'prop-types';

const MobileFilters = ({ filter, handleFilter, distinctValues, filteredCars, isOpen, onClose, handleClearFilters, resultCount }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [isOpen, onClose]);

  const total = resultCount ?? filteredCars.length;

  return (
    <div className={`vt-sheet-root ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      <div className="vt-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="vt-sheet" role="dialog" aria-modal="true" aria-label="Filtros">
        <div className="vt-sheet-head">
          <h2>Filtros</h2>
          <button type="button" className="vt-sheet-close" onClick={onClose} aria-label="Cerrar filtros" tabIndex={isOpen ? 0 : -1}>
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        <div className="vt-sheet-body vt-fields">
          <div className="vt-field">
            <label htmlFor="marca-mobile">Marca</label>
            <select
              name="marca"
              id="marca-mobile"
              value={filter.marca}
              onChange={handleFilter}
            >
              <option value="">Todas</option>
              {distinctValues(filteredCars, "marca")
                .sort()
                .map((marca) => (
                  <option key={marca} value={marca}>
                    {marca}
                  </option>
                ))}
            </select>
          </div>
          <div className="vt-field">
            <label htmlFor="linea-mobile">Línea</label>
            <select
              name="linea"
              id="linea-mobile"
              value={filter.linea}
              onChange={handleFilter}
            >
              <option value="">Todas</option>
              {distinctValues(filteredCars, "linea")
                .sort()
                .map((linea) => (
                  <option key={linea} value={linea}>
                    {linea}
                  </option>
                ))}
            </select>
          </div>
          <div className="vt-field">
            <label htmlFor="modelo-mobile">Modelo</label>
            <select
              name="modelo"
              id="modelo-mobile"
              value={filter.modelo}
              onChange={handleFilter}
            >
              <option value={0}>Todos</option>
              {distinctValues(filteredCars, "modelo")
                .sort()
                .map((modelo) => (
                  <option key={modelo} value={modelo}>
                    {modelo}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="vt-sheet-foot">
          <button type="button" className="vt-btn vt-btn-secondary" onClick={handleClearFilters} tabIndex={isOpen ? 0 : -1}>
            Limpiar
          </button>
          <button type="button" className="vt-btn vt-btn-primary" onClick={onClose} tabIndex={isOpen ? 0 : -1}>
            {`Ver ${total} ${total === 1 ? 'resultado' : 'resultados'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

MobileFilters.propTypes = {
  filter: PropTypes.shape({
    marca: PropTypes.string,
    linea: PropTypes.string,
    modelo: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  handleFilter: PropTypes.func.isRequired,
  distinctValues: PropTypes.func.isRequired,
  filteredCars: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handleClearFilters: PropTypes.func.isRequired,
  resultCount: PropTypes.number
};

export default MobileFilters;
