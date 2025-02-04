import PropTypes from 'prop-types';
import { Card, Breadcrumb, BreadcrumbItem } from 'reactstrap';

const Filters = ({ filter, handleFilter, distinctValues, filteredCars, handleClearFilters }) => {
  return (
    <div className="col-2">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Filtros</h5>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={handleClearFilters}
            >
              Limpiar filtros
            </button>
          </div>
          <div className="row">
            <div className="col-12">
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
            <div className="col-12">
              <label htmlFor="linea">Linea</label>
              <select
                className="form-control"
                name="linea"
                id="linea"
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
            <div className="col-12">
              <label htmlFor="modelo">Modelo</label>
              <select
                className="form-control"
                name="modelo"
                id="modelo"
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
      </div>
    </div>
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