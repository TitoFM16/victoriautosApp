import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
const LogoComponent = React.lazy(() => import('./shared/LogoComponent'));

const Header = () => {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <nav className="navbar navbar-expand-md navbar-dark navbar-page fixed-top bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          <span>
            <LogoComponent 
              size={41}
              alt="Victoriautos Consignataria logo"
            />
            <span>Victoriautos Consignataria</span>
          </span>
        </a>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Inicio
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/Vende">
                Vende tu usado
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/vitrina">
                Vitrina
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;



          