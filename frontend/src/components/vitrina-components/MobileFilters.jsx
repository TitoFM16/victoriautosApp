import PropTypes from 'prop-types';

const MobileFilters = ({ filter, handleFilter, distinctValues, filteredCars, isOpen, onClose, handleClearFilters }) => {
  return (
    <div className={`mobile-filter-drawer ${isOpen ? 'open' : ''}`}>
      <div className="mobile-filter-header">
        <h5>Filtros</h5>
        <div>
          <button 
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={handleClearFilters}
          >
            Limpiar
          </button>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
      </div>
      <div className="mobile-filter-content">
        <div className="filter-group">
          <label htmlFor="marca">Marca</label>
          <select
            className="form-control"
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
        <div className="filter-group">
          <label htmlFor="linea">Linea</label>
          <select
            className="form-control"
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
        <div className="filter-group">
          <label htmlFor="modelo">Modelo</label>
          <select
            className="form-control"
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
  handleClearFilters: PropTypes.func.isRequired
};

export default MobileFilters; 