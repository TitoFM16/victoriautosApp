import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/icons/logo.svg';

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (location.pathname.startsWith("/admin")) return null;

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `border-b-2 px-1 py-2 text-sm font-bold !no-underline transition-colors ${
      isActive
        ? 'border-victoria-red text-victoria-dark'
        : 'border-transparent text-zinc-500 hover:text-victoria-dark'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 sm:px-8" aria-label="Navegación principal">
        <Link className="flex min-w-0 items-center gap-3 !no-underline" to="/" onClick={handleNavClick}>
          <img 
            src={logo} 
            className="h-11 w-11 shrink-0"
            alt="Victoriautos Consignataria logo" 
            loading="eager" 
          />
          <span className="truncate text-[15px] font-black uppercase tracking-[0.12em] text-victoria-dark sm:text-lg">
            Victoriautos
          </span>
          <span className="hidden border-l border-zinc-300 pl-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 sm:block">
            Consignataria · Pasto
          </span>
        </Link>
        <button
          className="grid h-11 w-11 place-items-center border border-zinc-300 text-victoria-dark lg:hidden"
          type="button"
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <span className="text-2xl font-light leading-none" aria-hidden="true">×</span>
          ) : (
            <span className="relative block h-4 w-5" aria-hidden="true">
              <span className="absolute left-0 top-0 h-0.5 w-5 bg-current" />
              <span className="absolute left-0 top-[7px] h-0.5 w-5 bg-current" />
              <span className="absolute left-0 top-[14px] h-0.5 w-5 bg-current" />
            </span>
          )}
        </button>
        <div className="hidden items-center gap-7 lg:flex">
          <NavLink className={linkClass} to="/">Inicio</NavLink>
          <NavLink className={linkClass} to="/vitrina">Vehículos</NavLink>
          <NavLink className={linkClass} to="/vende">Vende tu usado</NavLink>
          <NavLink className="bg-victoria-red px-5 py-3 text-sm font-black text-white !no-underline transition hover:bg-red-800" to="/financiamiento">
            Financiación
          </NavLink>
        </div>
      </nav>
      {isOpen && (
        <div id="mobile-navigation" className="border-t border-zinc-200 bg-white px-5 py-5 lg:hidden">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-2">
            <NavLink className={linkClass} to="/" onClick={handleNavClick}>Inicio</NavLink>
            <NavLink className={linkClass} to="/vitrina" onClick={handleNavClick}>Vehículos</NavLink>
            <NavLink className={linkClass} to="/vende" onClick={handleNavClick}>Vende tu usado</NavLink>
            <NavLink className="mt-2 bg-victoria-red px-5 py-3 text-center text-sm font-black text-white !no-underline" to="/financiamiento" onClick={handleNavClick}>Financiación</NavLink>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
