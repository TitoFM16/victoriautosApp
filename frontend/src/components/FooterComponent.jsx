import { Link, useLocation } from 'react-router-dom';

import FacebookIcon from '../assets/icons/facebook-f-brands-solid.svg';
import InstagramIcon from '../assets/icons/instagram-brands-solid.svg';
import WhatsappIcon from '../assets/icons/whatsapp-brands-solid.svg';
import { WHATSAPP_DISPLAY, whatsappUrl } from '../services/whatsapp';

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Victoriautos+Av+Panamericana+Calle+16+35-69+Pasto';

function Footer() {
  const location = useLocation();
  if (location.pathname.includes('/admin')) return null;

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link className="site-footer__logo" to="/" aria-label="Victoriautos, inicio">
            <img src="/logo.svg" alt="" width="44" height="44" loading="lazy" />
            <span>
              <strong>Victoriautos</strong>
              <small>Consignataria · Pasto</small>
            </span>
          </Link>
          <p>Vehículos, orientación y respaldo para comprar o vender con más tranquilidad.</p>
          <div className="site-footer__social">
            {[
              ['Facebook', 'https://www.facebook.com', FacebookIcon],
              ['Instagram', 'https://www.instagram.com', InstagramIcon],
              ['WhatsApp', whatsappUrl(), WhatsappIcon],
            ].map(([label, href, icon]) => (
              <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
                <img src={icon} alt="" width="16" height="16" />
              </a>
            ))}
          </div>
        </div>

        <div className="site-footer__col">
          <h2 className="site-footer__title">Sala de ventas</h2>
          <address>
            San Juan de Pasto, Nariño<br />
            Av. Panamericana, Calle 16 #35-69
          </address>
          <a className="site-footer__link" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
            Cómo llegar <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="site-footer__col">
          <h2 className="site-footer__title">Horarios</h2>
          <p>Lunes a viernes · 8:00 am–6:00 pm</p>
          <p>Sábados y festivos · 8:00 am–4:00 pm</p>
        </div>

        <div className="site-footer__col">
          <h2 className="site-footer__title">Contacto</h2>
          <a className="site-footer__link" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
          <h2 className="site-footer__title site-footer__title--spaced">Servicios</h2>
          <nav className="site-footer__nav" aria-label="Servicios">
            <Link to="/vitrina">Comprar vehículo</Link>
            <Link to="/vende">Vender mi vehículo</Link>
            <Link to="/financiamiento">Financiación</Link>
          </nav>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} Victoriautos Consignataria S.A.S.</span>
      </div>
    </footer>
  );
}

export default Footer;
