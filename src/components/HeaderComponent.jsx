import React from 'react';
import {useLocation, NavLink} from 'react-router-dom';
import logo from '../assets/images/logo_.webp';

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  
  render() {
    const NavRender = () => {
      const location = useLocation();

      if (location.pathname != "/admin" && !(location.pathname.includes("/admin/")) ) {
        return (
          <nav className="navbar navbar-expand-md navbar-dark navbar-page fixed-top bg-light">
            <div className="container-fluid">
              <a className="navbar-brand" href="/">
                <span>
                  <img src={logo} height="41" width="41" alt="logo" />
                  Victoriautos Consignataria
                </span>
              </a>
              <button 
                className="navbar-toggler" 
                type="button" 
                onClick={this.toggle}
                aria-expanded={this.state.isOpen ? "true" : "false"}
                aria-label="Toggle navigation"
                aria-labelledby="menu-label"
              >
                <span className="navbar-toggler-icon" aria-hidden="true" aria-label="Toggle navigation" ></span>
              </button>
              <div className={`collapse navbar-collapse ${this.state.isOpen ? 'show' : ''}`}>
                <ul className="navbar-nav ms-auto">
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/" onClick={this.toggle}>
                      Inicio
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/Vende" onClick={this.toggle}>
                      Vende tu usado
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/vitrina" onClick={this.toggle}>
                      Vitrina
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        )
      } 
    }

    return (
      <div>
        {<NavRender/>}
      </div>
    );
  }
}

export default Header;