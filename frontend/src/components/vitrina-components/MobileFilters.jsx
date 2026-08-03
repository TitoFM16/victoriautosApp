import PropTypes from 'prop-types';

const selectClass = 'mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-victoria-dark outline-none transition focus:border-victoria-red focus:ring-2 focus:ring-red-100';
const labelClass = 'text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500';

const MobileFilters = ({ filter, handleFilter, distinctValues, filteredCars, isOpen, onClose, handleClearFilters }) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-[0_-20px_60px_rgba(0,0,0,.25)] transition-transform lg:hidden ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-victoria-red">Filtros</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500 transition hover:text-victoria-red"
              onClick={handleClearFilters}
            >
              Limpiar
            </button>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center border border-zinc-300 text-victoria-dark"
              onClick={onClose}
              aria-label="Cerrar filtros"
            >
              <span className="text-xl font-light leading-none">×</span>
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-5 pb-4">
          <div>
            <label className={labelClass} htmlFor="marca-mobile">Marca</label>
            <select
              className={selectClass}
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
          <div>
            <label className={labelClass} htmlFor="linea-mobile">Línea</label>
            <select
              className={selectClass}
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
          <div>
            <label className={labelClass} htmlFor="modelo-mobile">Modelo</label>
            <select
              className={selectClass}
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

        <button
          type="button"
          className="w-full rounded-xl bg-victoria-red px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-800"
          onClick={onClose}
        >
          Ver resultados
        </button>
      </div>
    </>
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
