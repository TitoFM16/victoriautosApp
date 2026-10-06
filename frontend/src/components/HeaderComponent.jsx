import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import WhatsappIcon from '../assets/icons/whatsapp-brands-solid.svg';
import { whatsappUrl } from '../services/whatsapp';

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/vitrina', label: 'Vehículos' },
  { to: '/vende', label: 'Vende tu usado' },
  { to: '/financiamiento', label: 'Financiación' },
];

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 8);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  // Close the menu on any navigation.
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Escape closes the menu, and the page behind it doesn't scroll while open.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 992) setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (location.pathname.startsWith('/admin')) return null;

  const close = () => setIsOpen(false);
  const linkClass = ({ isActive }) => `va-nav-link${isActive ? ' is-active' : ''}`;

  return (
    <>
      <header className={`site-header${scrolled || isOpen ? ' is-scrolled' : ''}`}>
        <div className="site-header__inner">
          <Link className="va-brand" to="/" onClick={close} aria-label="Victoriautos, inicio">
            <img src="/logo.svg" className="va-brand__logo" alt="" width="44" height="44" loading="eager" />
            <span className="va-brand__text">
              <span className="va-brand__name">Victoriautos</span>
              <span className="va-brand__tag">Consignataria · Pasto</span>
            </span>
          </Link>

          <nav className="va-nav" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} className={linkClass} to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            <a
              className="va-wa-btn"
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escríbenos por WhatsApp"
            >
              <img src={WhatsappIcon} alt="" width="18" height="18" />
              <span className="va-wa-btn__label">WhatsApp</span>
            </a>
            <button
              className="va-menu-btn"
              type="button"
              aria-controls="mobile-navigation"
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setIsOpen((open) => !open)}
            >
              <span className={`va-burger${isOpen ? ' is-open' : ''}`} aria-hidden="true">
                <span /><span /><span />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise trap position:fixed. */}
      <div className={`va-drawer${isOpen ? ' is-open' : ''}`} id="mobile-navigation" aria-hidden={!isOpen} inert={!isOpen ? '' : undefined}>
        <button className="va-drawer__scrim" type="button" tabIndex={-1} aria-label="Cerrar menú" onClick={close} />
        <div className="va-drawer__panel">
          <nav className="va-drawer__nav" aria-label="Menú móvil">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} className={linkClass} to={item.to} end={item.end} onClick={close}>
                {item.label}
                <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
              </NavLink>
            ))}
          </nav>
          <a className="va-wa-btn va-wa-btn--block" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            <img src={WhatsappIcon} alt="" width="20" height="20" />
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </>
  );
};

export default Header;
