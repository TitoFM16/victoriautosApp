import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import VehicleCard from '../shared/VehicleCard';

const MAX_CARDS = 6;

function CarCarousel() {
  const { cars, loading, error } = useSelector((state) => state.cars);

  const sortedCars = [...cars].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return new Date(b.updated_at) - new Date(a.updated_at);
  }).slice(0, MAX_CARDS);

  return (
    <section className="home-inventory" aria-labelledby="latest-vehicles-title">
      <div className="home-container">
        <div className="home-section-head">
          <div>
            <p className="home-eyebrow">Recién llegados</p>
            <h2 id="latest-vehicles-title" className="home-h2">Vehículos para conocer</h2>
          </div>
          <Link to="/vitrina" className="home-btn home-btn--secondary">
            Ver inventario completo
            <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </Link>
        </div>

        {loading && cars.length === 0 && (
          <div className="home-cards" aria-label="Cargando vehículos" aria-busy="true">
            {[0, 1, 2].map((item) => (
              <div key={item} className="va-vcard va-vcard--skeleton" aria-hidden="true">
                <div className="vehicle-image is-loading" />
                <div className="va-vcard__body">
                  <div className="va-skel va-skel--title" />
                  <div className="va-skel va-skel--meta" />
                  <div className="va-skel va-skel--price" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="home-notice" role="alert">
            <span className="material-symbols-outlined" aria-hidden="true">error</span>
            <div>
              <p className="home-notice__title">No pudimos cargar el inventario en este momento.</p>
              <p className="home-notice__text">Puedes visitar la vitrina o contactarnos para conocer los vehículos disponibles.</p>
            </div>
          </div>
        )}

        {!loading && !error && sortedCars.length === 0 && (
          <div className="home-empty">
            <div>
              <p className="home-eyebrow home-eyebrow--light">Inventario en actualización</p>
              <h3 className="home-empty__title">Estamos preparando nuevas opciones.</h3>
              <p className="home-empty__text">Cuéntanos qué vehículo buscas y nuestro equipo te ayuda a encontrarlo.</p>
            </div>
            <Link to="/interes" className="home-btn home-btn--primary">Déjanos tu búsqueda</Link>
          </div>
        )}

        {sortedCars.length > 0 && (
          <div className="home-cards">
            {sortedCars.map((car, index) => (
              <VehicleCard key={car.id} car={car} eager={index < 3} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default CarCarousel;
