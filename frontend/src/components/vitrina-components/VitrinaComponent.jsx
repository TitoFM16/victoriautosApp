import { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import filterIcon from '../../assets/icons/filters.svg';
import PropTypes from 'prop-types';
import { whatsappUrl } from '../../services/whatsapp';
import VehicleCard from '../shared/VehicleCard';

// Lazy load the filter components
const Filters = lazy(() => import('./Filters'));
const MobileFilters = lazy(() => import('./MobileFilters'));

const SORT_OPTIONS = [
  ['recientes', 'Más recientes'],
  ['precio-asc', 'Precio: menor a mayor'],
  ['precio-desc', 'Precio: mayor a menor'],
  ['anio-desc', 'Año: más nuevo'],
  ['km-asc', 'Menor kilometraje'],
];

const num = (value, fallback = 0) => {
  const parsed = parseFloat(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sortCarsBy = (list, sort) => {
  const copy = [...list];
  switch (sort) {
    case 'precio-asc': return copy.sort((a, b) => num(a.price, Infinity) - num(b.price, Infinity));
    case 'precio-desc': return copy.sort((a, b) => num(b.price, -Infinity) - num(a.price, -Infinity));
    case 'anio-desc': return copy.sort((a, b) => num(b.modelo) - num(a.modelo));
    case 'km-asc': return copy.sort((a, b) => num(a.km, Infinity) - num(b.km, Infinity));
    default: return list;
  }
};

const WhatsAppGlyph = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.1L2 22l5-1.6A9.9 9.9 0 1 0 12.04 2Zm5.8 14c-.25.7-1.45 1.35-2 1.4-.5.07-1.1.1-1.77-.11-.4-.13-.92-.3-1.58-.59-2.8-1.2-4.62-4.03-4.76-4.22-.14-.18-1.13-1.5-1.13-2.86 0-1.36.71-2.03.96-2.3.25-.28.55-.35.73-.35h.52c.17 0 .4-.06.62.48.23.55.78 1.9.85 2.04.07.14.11.3.02.48-.1.18-.14.3-.28.46-.14.16-.3.36-.42.48-.14.14-.28.29-.12.57.16.28.72 1.18 1.54 1.91 1.06.94 1.95 1.23 2.23 1.37.28.14.44.12.6-.07.16-.18.7-.82.88-1.1.18-.28.37-.23.62-.14.25.09 1.6.75 1.88.89.28.14.46.21.53.32.07.12.07.67-.18 1.37Z" />
  </svg>
);

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 991);
  const [sort, setSort] = useState('recientes');
  // Cars arrive asynchronously from the parent; show skeletons briefly while the list is still empty.
  const carsLoading = useSelector((state) => state.cars?.loading);
  const [graceActive, setGraceActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setGraceActive(false), 4000);
    return () => clearTimeout(timer);
  }, []);

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
      setIsMobile(window.innerWidth <= 991);
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

  const activeChips = [
    filter.marca && { key: 'marca', label: filter.marca, value: '' },
    filter.linea && { key: 'linea', label: filter.linea, value: '' },
    parseInt(filter.modelo) !== 0 && { key: 'modelo', label: `Modelo ${filter.modelo}`, value: 0 },
  ].filter(Boolean);
  const activeCount = activeChips.length;

  const removeChip = (key, value) => handleFilter({ target: { name: key, value } });

  const sortedCars = sortCarsBy(filteredCars, sort);
  const count = filteredCars.length;
  const countLabel = `${count} ${count === 1 ? 'vehículo disponible' : 'vehículos disponibles'}`;
  const showSkeleton = cars.length === 0 && (carsLoading || graceActive);

  return (
    <div className="vt-page">
      <header className="vt-header">
        <nav aria-label="breadcrumb" className="vt-breadcrumb">
          <Link to="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Vitrina</span>
        </nav>
        <h1>Vehículos disponibles</h1>
        <p className="vt-subline">Usados seleccionados en Pasto. Pregunta sin compromiso por WhatsApp.</p>
      </header>

      <div className="vt-layout">
        <Suspense fallback={null}>
          {isMobile ? (
            <MobileFilters
              filter={filter}
              handleFilter={handleFilter}
              distinctValues={distinctValues}
              filteredCars={filteredCars}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              handleClearFilters={handleClearFilters}
              resultCount={count}
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

        <div className="vt-main">
          <div className="vt-toolbar">
            {isMobile && (
              <button type="button" className="vt-filter-btn" onClick={() => setIsFilterOpen(true)}>
                <img src={filterIcon} alt="" width="16" height="16" />
                Filtros
                {activeCount > 0 && <span className="vt-filter-badge">{activeCount}</span>}
              </button>
            )}
            <p className="vt-count" aria-live="polite">{showSkeleton ? 'Cargando vehículos…' : countLabel}</p>
            <label className="vt-sort">
              <span>Ordenar</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          {activeCount > 0 && (
            <div className="vt-chips" aria-label="Filtros activos">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className="vt-chip"
                  onClick={() => removeChip(chip.key, chip.value)}
                  aria-label={`Quitar filtro ${chip.label}`}
                >
                  {chip.label}
                  <span aria-hidden="true">×</span>
                </button>
              ))}
              <button type="button" className="vt-chip-clear" onClick={handleClearFilters}>Limpiar todo</button>
            </div>
          )}

          {showSkeleton ? (
            <div className="vt-grid" aria-busy="true">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="vt-skeleton" aria-hidden="true">
                  <div className="vt-skeleton-media" />
                  <div className="vt-skeleton-line" />
                  <div className="vt-skeleton-line vt-short" />
                </div>
              ))}
            </div>
          ) : count === 0 ? (
            <div className="vt-empty">
              <span className="material-symbols-outlined" aria-hidden="true">search_off</span>
              <h2>{hasActiveFilters ? 'Ningún vehículo coincide con estos filtros' : 'Estamos preparando nuevas opciones'}</h2>
              <p>
                {hasActiveFilters
                  ? 'Prueba quitando algún filtro o cuéntanos qué vehículo buscas.'
                  : 'Cuéntanos qué vehículo buscas y nuestro equipo te ayuda a encontrarlo.'}
              </p>
              <div className="vt-empty-actions">
                {hasActiveFilters && (
                  <button type="button" className="vt-btn vt-btn-secondary" onClick={handleClearFilters}>Limpiar filtros</button>
                )}
                <a
                  className="vt-btn vt-btn-wa"
                  href={whatsappUrl('Hola Victoriautos, estoy buscando un carro y no lo encontré en la vitrina.')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppGlyph />
                  ¿No encuentras lo que buscas? Te ayudamos
                </a>
              </div>
            </div>
          ) : (
            <div className="vt-grid">
              {sortedCars.map((car, index) => (
                <VehicleCard key={car.id} car={car} eager={index < 3} />
              ))}
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
      km: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      featured: PropTypes.bool,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
    })
  ).isRequired
};

export default Vitrina;
