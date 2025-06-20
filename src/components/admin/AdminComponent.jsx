import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, Outlet, NavLink } from 'react-router-dom';
import { logout } from '../../redux/actions/loginActions';

const LogoComponent = React.lazy(() => import('../shared/LogoComponent'));

const HomeIcon = <span className="material-symbols-outlined">home</span>
const DashboardIcon = <span className="material-symbols-outlined">monitoring</span>
const FolderOpenIcon = <span className="material-symbols-outlined">folder_open</span>
const CarIcon = <span className="material-symbols-outlined">directions_car</span>
const UsuariosIcon = <span className="material-symbols-outlined">group</span>
const HandShakeIcon = <span className="material-symbols-outlined">handshake</span>
const AlmacenIcon = <span className="material-symbols-outlined">store</span>
const OfertaIcon = <span className="material-symbols-outlined">sell</span>

function Sidebar() {
    const dispatch = useDispatch();
    const [isVehicleSubmenuOpen, setIsVehicleSubmenuOpen] = useState(false);
    const [isUserSubmenuOpen, setIsUserSubmenuOpen] = useState(false);

    const logoutUser = () => {
        try {
            dispatch(logout());
        } catch {
            alert('Error al cerrar sesión');
        }
    }

    const handleVehicleSubmenuClick = (e) => {
        e.preventDefault();
        setIsVehicleSubmenuOpen(!isVehicleSubmenuOpen);
    };

    const handleUserSubmenuClick = (e) => {
        e.preventDefault();
        setIsUserSubmenuOpen(!isUserSubmenuOpen);
    };

    const closeVehicleSubmenu = () => {
        setIsVehicleSubmenuOpen(false);
    };
    
    return (
        <div>
            <div className="container-fluid">
                <div className="row flex-nowrap">
                    <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark left-bar-admin">
                        <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100 sticky-top">
                            <NavLink to="/admin" className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                                <span><LogoComponent size={41} /></span>
                                <p className='d-none d-sm-inline'>Victoriautos</p>
                            </NavLink>
                            <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
                                <li className="nav-item">
                                    <NavLink to="home" className={({ isActive }) => `nav-link align-middle px-0 ${isActive ? 'active' : ''}`}>
                                        {HomeIcon} <span className="ms-1 d-none d-sm-inline">Home</span>
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="negocios" className={({ isActive }) => `nav-link align-middle px-0 ${isActive ? 'active' : ''}`}>
                                        {HandShakeIcon} <span className="ms-2 d-none d-sm-inline">Negocios</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="dashboard" className={({ isActive }) => `nav-link px-0 align-middle ${isActive ? 'active' : ''}`}>
                                        {DashboardIcon} <span className="ms-1 d-none d-sm-inline">Dashboard</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="tramites" className={({ isActive }) => `nav-link align-middle px-0 ${isActive ? 'active' : ''}`}>
                                        {FolderOpenIcon} <span className="ms-1 d-none d-sm-inline">Tramites</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <a href="#" onClick={handleVehicleSubmenuClick} className="nav-link px-0 align-middle">
                                        {CarIcon} <span className="ms-1 d-none d-sm-inline">Vehiculos</span>
                                    </a>
                                    <ul className={`nav flex-column ms-1 ${isVehicleSubmenuOpen ? 'show' : 'collapse'}`} id="submenu2" data-bs-parent="#menu">
                                        <li className="w-100">
                                            <NavLink to="vitrina" className={({ isActive }) => `nav-link px-0 ${isActive ? 'active' : ''}`} onClick={closeVehicleSubmenu}>
                                                {AlmacenIcon} <span className="ms-1 d-sm-inline">En Vitrina</span>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="ofertas" className={({ isActive }) => `nav-link px-0 ${isActive ? 'active' : ''}`} onClick={closeVehicleSubmenu}>
                                                {OfertaIcon} <span className="ms-1 d-sm-inline">Ofertados</span>
                                            </NavLink>
                                        </li>
                                    </ul>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="buscado" className={({ isActive }) => `nav-link align-middle px-0 ${isActive ? 'active' : ''}`}>
                                        <span className="material-symbols-outlined">interests</span>
                                        <span className="ms-2 d-none d-sm-inline">Intereses</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <a href="#" onClick={handleUserSubmenuClick} className="nav-link px-0 align-middle">
                                        {UsuariosIcon} <span className="ms-1 d-none d-sm-inline">Usuarios</span>
                                    </a>
                                    <ul className={`nav flex-column ms-1 ${isUserSubmenuOpen ? 'show' : 'collapse'}`} id="submenu3" data-bs-parent="#menu">
                                        <li className="w-100">
                                            <a href="/#" className="nav-link px-0">
                                                <span className="d-none d-sm-inline">Clientes</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/#" className="nav-link px-0">
                                                <span className="d-none d-sm-inline">Trabajadores</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                            <hr/>
                            <div className="dropdown pb-4">
                                <a href="/#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img src="" alt="" width="30" height="30" className="rounded-circle"/>
                                    <span className="d-none d-sm-inline mx-1"></span>
                                </a>
                                <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
                                    <li><a className="dropdown-item" href="/#">New project...</a></li>
                                    <li><a className="dropdown-item" href="/#">Settings</a></li>
                                    <li><a className="dropdown-item" href="/#">Profile</a></li>
                                    <li><hr className="dropdown-divider"/></li>
                                    <li><button className="dropdown-item" onClick={logoutUser}>Sign out</button></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col py-3">
                        {<MainContent/>}
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MainContent() {
    const location = useLocation();

    if (location.pathname !== "/admin" && location.pathname !== "/admin/") {
        return null;
    }
    return (
        <div className='container'>
            <div className='row'>
                <div className='col-12'>
                </div>
            </div>
        </div>
    );
}

function AdminComponent() {
    return (
        <React.Fragment>
            <Sidebar />
        </React.Fragment>
    );
}

export default AdminComponent;