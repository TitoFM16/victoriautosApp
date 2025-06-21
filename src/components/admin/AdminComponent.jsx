import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, Outlet, NavLink } from 'react-router-dom';
import { logout } from '../../redux/actions/loginActions';
import './AdminComponent.css';

const LogoComponent = React.lazy(() => import('../shared/LogoComponent'));

const HomeIcon = <span className="material-symbols-outlined">home</span>
const DashboardIcon = <span className="material-symbols-outlined">monitoring</span>
const FolderOpenIcon = <span className="material-symbols-outlined">folder_open</span>
const CarIcon = <span className="material-symbols-outlined">directions_car</span>
const UsuariosIcon = <span className="material-symbols-outlined">group</span>
const HandShakeIcon = <span className="material-symbols-outlined">handshake</span>
const AlmacenIcon = <span className="material-symbols-outlined">store</span>
const OfertaIcon = <span className="material-symbols-outlined">sell</span>
const MenuIcon = <span className="material-symbols-outlined">menu</span>

function Sidebar() {
    const dispatch = useDispatch();
    const [isVehicleSubmenuOpen, setIsVehicleSubmenuOpen] = useState(false);
    const [isUserSubmenuOpen, setIsUserSubmenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebarOnMobile = () => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };
    
    return (
        <div className="d-flex flex-column h-100">
            {/* Mobile Header */}
            <div className="mobile-header d-md-none">
                <div className="mobile-header-content">
                    <NavLink to="/admin" className="mobile-logo">
                        <LogoComponent size={32} />
                        <span className="mobile-title">Victoriautos</span>
                    </NavLink>
                    <button 
                        className="mobile-menu-button"
                        onClick={toggleSidebar}
                        aria-label="Toggle menu"
                    >
                        {MenuIcon}
                    </button>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="mobile-overlay position-fixed d-md-none"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`admin-sidebar bg-dark ${isSidebarOpen ? 'show' : ''}`}>
                <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
                    {/* Desktop Logo - hidden on mobile */}
                    <NavLink 
                        to="/admin" 
                        className="d-none d-md-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none"
                        onClick={closeSidebarOnMobile}
                    >
                        <span><LogoComponent size={41} /></span>
                        <p className='d-none d-sm-inline'>Victoriautos</p>
                    </NavLink>
                    <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start w-100">
                        <li className="nav-item w-100">
                            <NavLink 
                                to="home" 
                                className={({ isActive }) => `nav-link align-middle px-0 ${isActive ? 'active' : ''}`}
                                onClick={closeSidebarOnMobile}
                            >
                                {HomeIcon} <span className="ms-1">Home</span>
                            </NavLink>
                        </li>
                        <li className="nav-item w-100">
                            <NavLink 
                                to="negocios" 
                                className={({ isActive }) => `nav-link align-middle px-0 ${isActive ? 'active' : ''}`}
                                onClick={closeSidebarOnMobile}
                            >
                                {HandShakeIcon} <span className="ms-2">Negocios</span>
                            </NavLink>
                        </li>
                        <li className="w-100">
                            <NavLink 
                                to="dashboard" 
                                className={({ isActive }) => `nav-link px-0 align-middle ${isActive ? 'active' : ''}`}
                                onClick={closeSidebarOnMobile}
                            >
                                {DashboardIcon} <span className="ms-1">Dashboard</span>
                            </NavLink>
                        </li>
                        <li className="w-100">
                            <NavLink 
                                to="tramites" 
                                className={({ isActive }) => `nav-link align-middle px-0 ${isActive ? 'active' : ''}`}
                                onClick={closeSidebarOnMobile}
                            >
                                {FolderOpenIcon} <span className="ms-1">Tramites</span>
                            </NavLink>
                        </li>
                        <li className="w-100">
                            <a href="#" onClick={handleVehicleSubmenuClick} className="nav-link px-0 align-middle">
                                {CarIcon} <span className="ms-1">Vehiculos</span>
                            </a>
                            <ul className={`submenu nav flex-column ms-1 ${isVehicleSubmenuOpen ? 'show' : ''}`}>
                                <li className="w-100">
                                    <NavLink 
                                        to="vitrina" 
                                        className={({ isActive }) => `nav-link px-0 ${isActive ? 'active' : ''}`} 
                                        onClick={() => {
                                            closeVehicleSubmenu();
                                            closeSidebarOnMobile();
                                        }}
                                    >
                                        {AlmacenIcon} <span className="ms-1">En Vitrina</span>
                                    </NavLink>
                                </li>
                                <li className="w-100">
                                    <NavLink 
                                        to="ofertas" 
                                        className={({ isActive }) => `nav-link px-0 ${isActive ? 'active' : ''}`} 
                                        onClick={() => {
                                            closeVehicleSubmenu();
                                            closeSidebarOnMobile();
                                        }}
                                    >
                                        {OfertaIcon} <span className="ms-1">Ofertados</span>
                                    </NavLink>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item w-100">
                            <NavLink 
                                to="buscado" 
                                className={({ isActive }) => `nav-link align-middle px-0 ${isActive ? 'active' : ''}`}
                                onClick={closeSidebarOnMobile}
                            >
                                <span className="material-symbols-outlined">interests</span>
                                <span className="ms-2">Intereses</span>
                            </NavLink>
                        </li>
                        <li className="w-100">
                            <a href="#" onClick={handleUserSubmenuClick} className="nav-link px-0 align-middle">
                                {UsuariosIcon} <span className="ms-1">Usuarios</span>
                            </a>
                            <ul className={`submenu nav flex-column ms-1 ${isUserSubmenuOpen ? 'show' : ''}`}>
                                <li className="w-100">
                                    <a href="/#" className="nav-link px-0">
                                        <span>Clientes</span>
                                    </a>
                                </li>
                                <li className="w-100">
                                    <a href="/#" className="nav-link px-0">
                                        <span>Trabajadores</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                    <hr className="w-100"/>
                    <div className="dropdown pb-4 w-100">
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

            {/* Main Content */}
            <div className="admin-content">
                <div className="p-3">
                    {<MainContent/>}
                    <Outlet />
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