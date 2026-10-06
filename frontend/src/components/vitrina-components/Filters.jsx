import PropTypes from 'prop-types';

const Filters = ({ filter, handleFilter, distinctValues, filteredCars, handleClearFilters }) => {
  return (
    <aside className="vt-sidebar" aria-label="Filtros">
      <div className="vt-filter-card">
        <div className="vt-filter-head">
          <p>Filtros</p>
          <button type="button" className="vt-link-btn" onClick={handleClearFilters}>
            Limpiar
          </button>
        </div>

        <div className="vt-fields">
          <div className="vt-field">
            <label htmlFor="marca">Marca</label>
            <select
              name="marca"
              id="marca"
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
            <label htmlFor="linea">Línea</label>
            <select
              name="linea"
              id="linea"
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
            <label htmlFor="modelo">Modelo</label>
            <select
              name="modelo"
              id="modelo"
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
      </div>
    </aside>
  );
};

Filters.propTypes = {
  filter: PropTypes.shape({
    marca: PropTypes.string,
    linea: PropTypes.string,
    modelo: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  handleFilter: PropTypes.func.isRequired,
  distinctValues: PropTypes.func.isRequired,
  filteredCars: PropTypes.array.isRequired,
  handleClearFilters: PropTypes.func.isRequired
};

export default Filters;
