import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import VehicleImage from './VehicleImage';
import { carWhatsappUrl } from '../../services/whatsapp';

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
});

// Card v2. Whole card is clickable through the stretched title link; the
// WhatsApp button sits above it (z-index) as a sibling, never nested in the <a>.
function VehicleCard({ car, eager = false }) {
  const meta = [
    car.modelo != null && car.modelo !== '' ? String(car.modelo) : null,
    car.km != null && car.km !== '' ? `${Number(car.km).toLocaleString('es-CO')} km` : null,
    car.transmision || null,
  ].filter(Boolean);
  const name = `${car.marca} ${car.linea}`;

  return (
    <article className="va-vcard">
      <div className="va-vcard__media">
        <VehicleImage
          src={car.images?.[0] ? `/images/vehiculos/${car.id}/${car.images[0]}` : undefined}
          alt={`${name}, modelo ${car.modelo}`}
          eager={eager}
        />
        {car.featured && <span className="va-vcard__badge">Destacado</span>}
      </div>
      <div className="va-vcard__body">
        <h3 className="va-vcard__title">
          <Link to={`/vitrina/${car.id}`} className="va-vcard__link" aria-label={`Ver ${name}`}>
            {name}
          </Link>
        </h3>
        {meta.length > 0 && (
          <p className="va-vcard__meta">
            {meta.map((item) => <span key={item}>{item}</span>)}
          </p>
        )}
        <p className="va-vcard__price">{money.format(car.price)}</p>
        <div className="va-vcard__footer">
          <span className="va-vcard__more" aria-hidden="true">
            Ver detalles
            <span className="material-symbols-outlined">arrow_forward</span>
          </span>
          <a
            className="va-vcard__wa"
            href={carWhatsappUrl(car)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Preguntar por WhatsApp por ${name}`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
        </div>
      </div>
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
    transmision: PropTypes.string,
    featured: PropTypes.bool,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  eager: PropTypes.bool,
};

export default VehicleCard;
