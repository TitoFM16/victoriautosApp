import { useEffect, useState, lazy, Suspense } from 'react';
import { Card, Breadcrumb, BreadcrumbItem, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import filterIcon from '../../assets/icons/filters.svg';
import PropTypes from 'prop-types';
import LoadingComponent from '../shared/loadingComponent';

// Lazy load the filter components
const Filters = lazy(() => import('./Filters'));
const MobileFilters = lazy(() => import('./MobileFilters'));

function formatMoney(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function RenderVitrinaItem({ car }) {
  const imagePath = "/images/vehiculos/";
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card className="car-card">
      <Link to={`/vitrina/${car._id}`} style={{ textDecoration: "none", color: "black" }}>
        <div className="image-container position-relative">
          {!imageLoaded && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
              <LoadingComponent />
            </div>
          )}
          <img
            className={`card-img-top-vitrina ${imageLoaded ? 'visible' : 'invisible'}`}
            src={imagePath + car.uuid + "/" + car.images[0]}
            alt={car.marca}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        <CardBody>
          <h3>${formatMoney(car.price)}</h3>
          <div>
            <h5 className='card-properties-text'>{car.marca} - {car.linea}</h5>
          </div>
          <h5 className='card-properties-text'>{car.modelo}</h5>
        </CardBody>
      </Link>
    </Card>
  );
}

RenderVitrinaItem.propTypes = {
  car: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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
      setIsMobile(window.innerWidth <= 768);
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
        return new Date(b.updatedAt) - new Date(a.updatedAt);
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

  const vitrina = filteredCars.map((car) => (
    <div key={car._id} id="cars" className="col-12 col-md-4 py-2">
      <RenderVitrinaItem car={car} />
    </div>
  ));

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
        <div className="col-12 text-center py-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading more cars...</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container vitrina">
      <div className="row">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/home">Inicio</Link>
          </BreadcrumbItem>
          <BreadcrumbItem active>Vitrina</BreadcrumbItem>
        </Breadcrumb>
        <div className="col-12">
          <h3>Vitrina</h3>
          <hr />
          {isMobile && (
            <div className="filter-button-container-top">
              <button className="filter-button" onClick={() => setIsFilterOpen(true)}>
                <img src={filterIcon} alt="Filters" />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="row">
        <Suspense fallback={<LoadingComponent/>}>
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
        <div className={isMobile ? "col-12" : "col-10"}>
          <div className="row">{vitrina}</div>
          {renderLoadingMore()}
        </div>
      </div>
    </div>
  );
};

Vitrina.propTypes = {
  cars: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      uuid: PropTypes.string.isRequired,
      images: PropTypes.arrayOf(PropTypes.string).isRequired,
      marca: PropTypes.string.isRequired,
      linea: PropTypes.string.isRequired,
      modelo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      price: PropTypes.number.isRequired
    })
  ).isRequired
};

export default Vitrina;