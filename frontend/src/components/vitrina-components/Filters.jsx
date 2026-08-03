import PropTypes from 'prop-types';

const selectClass = 'mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-victoria-dark outline-none transition focus:border-victoria-red focus:ring-2 focus:ring-red-100';
const labelClass = 'text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500';

const Filters = ({ filter, handleFilter, distinctValues, filteredCars, handleClearFilters }) => {
  return (
    <div className="lg:col-span-1">
      <div className="border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-victoria-red">Filtros</p>
          <button
            type="button"
            className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500 transition hover:text-victoria-red"
            onClick={handleClearFilters}
          >
            Limpiar
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className={labelClass} htmlFor="marca">Marca</label>
            <select
              className={selectClass}
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
          <div>
            <label className={labelClass} htmlFor="linea">Línea</label>
            <select
              className={selectClass}
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
          <div>
            <label className={labelClass} htmlFor="modelo">Modelo</label>
            <select
              className={selectClass}
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
