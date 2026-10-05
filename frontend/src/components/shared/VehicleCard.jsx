import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import VehicleImage from './VehicleImage';

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
});

function VehicleCard({ car, eager = false }) {
  return (
    <article className="vehicle-card">
      <Link to={`/vitrina/${car.id}`} aria-label={`Ver ${car.marca} ${car.linea}`}>
        <div className="vehicle-card-media">
          <VehicleImage
            src={car.images?.[0] ? `/images/vehiculos/${car.id}/${car.images[0]}` : undefined}
            alt={`${car.marca} ${car.linea}, modelo ${car.modelo}`}
            eager={eager}
          />
          {car.featured && <span className="vehicle-badge">Destacado</span>}
        </div>
        <div className="vehicle-card-body">
          <div className="vehicle-chips">
            <span>Modelo {car.modelo}</span>
            {car.km != null && <span>{Number(car.km).toLocaleString('es-CO')} km</span>}
          </div>
          <h3>{car.marca} {car.linea}</h3>
          <p className="vehicle-price">{money.format(car.price)}</p>
        </div>
      </Link>
    </article>
  );
}

VehicleCard.propTypes = {
  car: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    marca: PropTypes.string.isRequired,
    linea: PropTypes.string.isRequired,
    modelo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    km: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    featured: PropTypes.bool,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  eager: PropTypes.bool,
};

export default VehicleCard;
