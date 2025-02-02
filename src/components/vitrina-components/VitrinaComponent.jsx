import React, { useEffect, useState } from 'react';
import { Card, Breadcrumb, BreadcrumbItem, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import filterIcon from '../../assets/icons/filters.svg';

function formatMoney(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function RenderVitrinaItem({ car }) {
  const imagePath = "/images/vehiculos/";
  return (
    <Card className="car-card">
      <Link to={`/vitrina/${car._id}`} style={{ textDecoration: "none", color: "black" }}>
        <img
          className="card-img-top-vitrina"
          src={imagePath + car.uuid + "/" + car.images[0]}
          alt={car.marca}
        />
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

  const filteredCars = cars.filter((car) => {
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
    <div key={car.id} id="cars" className="col-12 col-md-4 py-2">
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
        {isMobile ? (
          <>
            <MobileFilters
              filter={filter}
              handleFilter={handleFilter}
              distinctValues={distinctValues}
              filteredCars={filteredCars}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              handleClearFilters={handleClearFilters}
            />
          </>
        ) : (
          <Filters
            filter={filter}
            handleFilter={handleFilter}
            distinctValues={distinctValues}
            filteredCars={filteredCars}
            handleClearFilters={handleClearFilters}
          />
        )}
        <div className={isMobile ? "col-12" : "col-10"}>
          <div className="row">{vitrina}</div>
        </div>
      </div>
    </div>
  );
};

export default Vitrina;