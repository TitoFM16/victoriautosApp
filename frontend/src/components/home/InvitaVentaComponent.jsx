import { useNavigate } from 'react-router-dom';
import { whatsappUrl } from '../../services/whatsapp';

const STEPS = [
  ['edit_note', 'Cuéntanos de tu carro', 'Marca, línea, modelo y kilometraje en un par de minutos.'],
  ['photo_camera', 'Lo valoramos y lo exhibimos', 'Te damos una valoración inicial y lo mostramos en nuestra vitrina.'],
  ['handshake', 'Te acompañamos hasta la venta', 'Negociación y trámites documentales con respaldo.'],
];

const InvitaVentaComponent = () => {
  const navigate = useNavigate();

  return (
    <section className="home-sell" aria-labelledby="home-sell-title">
      <div className="home-container home-sell__grid">
        <div className="home-sell__copy">
          <p className="home-eyebrow">Vende con respaldo</p>
          <h2 id="home-sell-title" className="home-h2">Tu usado también merece una buena negociación</h2>
          <p className="home-sell__text">
            Cuéntanos los datos de tu vehículo. Te orientamos con una valoración inicial y te acompañamos durante el proceso de venta.
          </p>
          <div className="home-sell__actions">
            <button type="button" className="home-btn home-btn--primary" onClick={() => navigate('/vende')}>
              Quiero vender mi vehículo
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </button>
            <a
              className="home-btn home-btn--whatsapp"
              href={whatsappUrl('Hola Victoriautos, quiero vender mi carro.')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Prefiero escribir por WhatsApp
            </a>
          </div>
        </div>

        <ol className="home-steps" aria-label="Cómo vender con Victoriautos">
          {STEPS.map(([icon, title, text], index) => (
            <li className="home-steps__item" key={title}>
              <span className="home-steps__icon material-symbols-outlined" aria-hidden="true">{icon}</span>
              <div>
                <p className="home-steps__title"><span className="home-steps__n">{index + 1}</span>{title}</p>
                <p className="home-steps__text">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default InvitaVentaComponent;
