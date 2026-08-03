import { lazy } from 'react';
import { Link, useLocation } from 'react-router-dom';

import FacebookIcon from '../assets/icons/facebook-f-brands-solid.svg';
import InstagramIcon from '../assets/icons/instagram-brands-solid.svg';
import WhatsappIcon from '../assets/icons/whatsapp-brands-solid.svg';

const LogoComponent = lazy(() => import('./shared/LogoComponent'));

function Footer() {
  const location = useLocation();
  if (location.pathname.includes('/admin')) return null;

  return (
    <footer className="bg-victoria-dark text-white">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.1fr_1fr_1fr] md:py-20">
        <div>
          <div className="flex items-center gap-4">
            <LogoComponent size="58" />
            <div>
              <p className="text-lg font-black uppercase tracking-[0.1em]">Victoriautos</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Consignataria · Pasto</p>
            </div>
          </div>
          <p className="mt-6 max-w-sm text-sm leading-6 text-white/55">Vehículos, orientación y respaldo para comprar o vender con más tranquilidad.</p>
          <div className="mt-7 flex gap-3">
            {[
              ['Facebook', 'https://www.facebook.com', FacebookIcon],
              ['Instagram', 'https://www.instagram.com', InstagramIcon],
              ['WhatsApp', 'https://wa.me/573155806571', WhatsappIcon],
            ].map(([label, href, icon]) => (
              <a key={label} href={href} aria-label={label} className="grid h-11 w-11 place-items-center border border-white/15 transition hover:border-victoria-red hover:bg-victoria-red">
                <img src={icon} className="h-4 w-4" alt="" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-400">Sala de ventas</p>
          <address className="mt-5 text-sm not-italic leading-7 text-white/65">
            <strong className="text-white">San Juan de Pasto, Nariño</strong><br />
            Av. Panamericana, Calle 16 #35-69<br /><br />
            Lunes a viernes · 8:00 am–6:00 pm<br />
            Sábados y festivos · 8:00 am–4:00 pm
          </address>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-400">Servicios</p>
          <nav className="mt-5 flex flex-col items-start gap-4" aria-label="Servicios">
            <Link className="text-sm font-bold text-white/65 !no-underline transition hover:text-white" to="/vitrina">Comprar vehículo →</Link>
            <Link className="text-sm font-bold text-white/65 !no-underline transition hover:text-white" to="/vende">Vender mi vehículo →</Link>
            <Link className="text-sm font-bold text-white/65 !no-underline transition hover:text-white" to="/financiamiento">Financiación →</Link>
            <a className="text-sm font-bold text-white/65 !no-underline transition hover:text-white" href="https://wa.me/573155806571">Contacto →</a>
          </nav>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
        © {new Date().getFullYear()} Victoriautos Consignataria S.A.S.
      </div>
    </footer>
  );
}

export default Footer;
