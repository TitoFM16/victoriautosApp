import { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import filterIcon from '../../assets/icons/filters.svg';
import PropTypes from 'prop-types';
import LoadingComponent from '../shared/loadingComponent';

// Lazy load the filter components
const Filters = lazy(() => import('./Filters'));
const MobileFilters = lazy(() => import('./MobileFilters'));

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function RenderVitrinaItem({ car }) {
  const imagePath = "/images/vehiculos/";
  const [imageLoaded, setImageLoaded] = useState(false);
  const image = car.images?.[0];

  return (
    <article className="group bg-white">
      <Link to={`/vitrina/${car.id}`} className="block text-victoria-dark no-underline" aria-label={`Ver ${car.marca} ${car.linea}`}>
        <div className="relative aspect-[16/10] overflow-hidden bg-zinc-200">
          {image && !imageLoaded && <div className="absolute inset-0 animate-pulse bg-zinc-200" />}
          {image ? (
            <img
              className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${imageLoaded ? 'visible' : 'invisible'}`}
              src={imagePath + car.id + "/" + image}
              alt={`${car.marca} ${car.linea}, modelo ${car.modelo}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="grid h-full place-items-center text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">Imagen próximamente</div>
          )}
          {car.featured && <span className="absolute left-0 top-0 bg-victoria-red px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white">Destacado</span>}
        </div>
        <div className="border border-t-0 border-zinc-200 p-6">
          <div className="flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
            <span>Modelo {car.modelo}</span>
            {car.km != null && <span>{Number(car.km).toLocaleString('es-CO')} km</span>}
          </div>
          <h3 className="mt-3 truncate !text-2xl font-black uppercase tracking-[-0.035em]">{car.marca} {car.linea}</h3>
          <p className="mt-6 border-t border-zinc-200 pt-5 text-xl font-black text-victoria-red">{formatMoney(car.price)}</p>
        </div>
      </Link>
    </article>
  );
}

RenderVitrinaItem.propTypes = {
  car: PropTypes.shape({
    id: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    marca: PropTypes.string.isRequired,
    linea: PropTypes.string.isRequired,
    modelo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    price: PropTypes.number.isRequired
  }).isRequired
};

const Vitrina = ({ cars }) => {
  const [filter, setFilter] = useState(() => {
    // Get URL search params
    const params = new URLSearchParams(window.location.search);

    return {
      marca: params.get('marca') || "",
      linea: params.get('linea') || "",
      modelo: params.get('modelo') || 0,
    };
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1023);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleFilter = (event) => {
    const { name, value } = event.target;
    const newFilter = {
      ...filter,
      [name]: value,
    };
    setFilter(newFilter);

    // Update URL
    const queryParams = new URLSearchParams();
    if (newFilter.marca) queryParams.set('marca', newFilter.marca);
    if (newFilter.linea) queryParams.set('linea', newFilter.linea);
    if (newFilter.modelo) queryParams.set('modelo', newFilter.modelo);

    const newUrl = `${window.location.pathname}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  };

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setFilter({
        marca: params.get('marca') || "",
        linea: params.get('linea') || "",
        modelo: params.get('modelo') || 0,
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1023);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const distinctValues = (array, key) => {
    const values = array.map((car) => car[key]);
    return [...new Set(values)];
  };

  // Function to sort cars based on featured status and update date
  const sortCars = (cars) => {
    return [...cars].sort((a, b) => {
      if (a.featured && !b.featured) {
        return -1; // 'a' comes first
      } else if (!a.featured && b.featured) {
        return 1; // 'b' comes first
      } else {
        // Both are either featured or not featured, so sort by update date
        return new Date(b.updated_at) - new Date(a.updated_at);
      }
    });
  };

  const filteredCars = sortCars(cars).filter((car) => {
    if (filter.marca === "" && filter.linea === "" && parseInt(filter.modelo) === 0) {
      return true;
    }
    return (
      (filter.marca === "" || car.marca === filter.marca) &&
      (filter.linea === "" || car.linea === filter.linea) &&
      (parseInt(filter.modelo) === 0 || parseInt(car.modelo) === parseInt(filter.modelo))
    );
  });

  const hasActiveFilters = filter.marca !== "" || filter.linea !== "" || parseInt(filter.modelo) !== 0;

  const handleClearFilters = () => {
    const newFilter = {
      marca: "",
      linea: "",
      modelo: 0,
    };
    setFilter(newFilter);

    // Clear URL parameters
    window.history.pushState({}, '', window.location.pathname);
  };

  // Add loading indicator at the bottom of the vitrina
  const renderLoadingMore = () => {
    if (isLoadingMore) {
      return (
        <div className="col-span-full flex justify-center py-8">
          <span className="h-8 w-8 animate-spin border-2 border-zinc-200 border-t-victoria-red" role="status" aria-label="Cargando más vehículos" />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14">
      <nav aria-label="breadcrumb" className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
        <Link to="/" className="!no-underline text-victoria-red hover:text-red-800">Inicio</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-500">Vitrina</span>
      </nav>

      <div className="mt-4 flex items-center justify-between border-b border-zinc-200 pb-7">
        <h1 className="!text-4xl font-black leading-none tracking-[-0.05em] text-victoria-dark sm:!text-5xl">Vitrina</h1>
        {isMobile && (
          <button
            type="button"
            className="grid h-11 w-11 shrink-0 place-items-center border border-zinc-300 text-victoria-dark"
            onClick={() => setIsFilterOpen(true)}
            aria-label="Abrir filtros"
          >
            <img src={filterIcon} alt="" className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <Suspense fallback={<LoadingComponent />}>
          {isMobile ? (
            <MobileFilters
              filter={filter}
              handleFilter={handleFilter}
              distinctValues={distinctValues}
              filteredCars={filteredCars}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              handleClearFilters={handleClearFilters}
            />
          ) : (
            <Filters
              filter={filter}
              handleFilter={handleFilter}
              distinctValues={distinctValues}
              filteredCars={filteredCars}
              handleClearFilters={handleClearFilters}
            />
          )}
        </Suspense>

        <div>
          {filteredCars.length === 0 ? (
            <div className="grid gap-6 bg-victoria-dark px-7 py-10 text-white sm:px-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-400">
                  {hasActiveFilters ? 'Sin resultados' : 'Inventario en actualización'}
                </p>
                <h2 className="mt-3 !text-2xl font-black tracking-[-0.03em] sm:!text-3xl">
                  {hasActiveFilters ? 'Ningún vehículo coincide con estos filtros.' : 'Estamos preparando nuevas opciones.'}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
                  {hasActiveFilters
                    ? 'Prueba a limpiar los filtros o cuéntanos qué vehículo buscas y te ayudamos a encontrarlo.'
                    : 'Cuéntanos qué vehículo buscas y nuestro equipo te ayuda a encontrarlo.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="border border-white/30 px-6 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-white transition hover:border-white"
                  >
                    Limpiar filtros
                  </button>
                )}
                <Link to="/interes" className="!no-underline bg-victoria-red px-6 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-white hover:bg-red-800">Déjanos tu búsqueda</Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCars.map((car) => (
                <RenderVitrinaItem key={car.id} car={car} />
              ))}
              {renderLoadingMore()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Vitrina.propTypes = {
  cars: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      images: PropTypes.arrayOf(PropTypes.string).isRequired,
      marca: PropTypes.string.isRequired,
      linea: PropTypes.string.isRequired,
      modelo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      price: PropTypes.number.isRequired
    })
  ).isRequired
};

export default Vitrina;
