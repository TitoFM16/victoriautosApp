import React from 'react';
import { useLocation } from 'react-router-dom';
import LogoComponent from './shared/LogoComponent';

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
              aria-label="Victoriautos Consignataria logo"
            />
            <span>Victoriautos Consignataria</span>
          </span>
        </a>
      </div>
    </nav>
  );
};

export default Header;