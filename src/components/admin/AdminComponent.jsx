import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, Outlet } from 'react-router-dom'; //Switch changed to routes Also redirect is changed to Navigate since version 6

import { logout } from '../../redux/actions/loginActions';

import logo from '../../assets/images/logo_.webp';

const HomeIcon = <span className="material-symbols-outlined">home</span>
const DashboardIcon = <span className="material-symbols-outlined">monitoring</span>
const FolderOpenIcon = <span className="material-symbols-outlined">folder_open</span>
const CarIcon = <span className="material-symbols-outlined">directions_car</span>
const UsuariosIcon = <span className="material-symbols-outlined">group</span>
const HandShakeIcon = <span className="material-symbols-outlined">handshake</span>

const AlmacenIcon = <span className="material-symbols-outlined">store</span>
const OfertaIcon = <span className="material-symbols-outlined">sell</span>

function Sidebar() {
    const navigate = useNavigate();

    //retrieve username from local storage creds key
    // const username = localStorage.getItem('creds') ? JSON.parse(localStorage.getItem('creds')).username : null;
    
    const dispatch = useDispatch();

    const logoutUser = () => {
        try {
            dispatch(logout());
          // Redirect to the home page or show a success message
        }   catch {
            alert('Error al cerrar sesión');
        }
    }
    
    return (
        <div>
            <div className="container-fluid">
                <div className="row flex-nowrap">
                    <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark left-bar-admin">
                        <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100 sticky-top" style={{textDecoration:"none",color:"white"}}>
                            <a href="/admin" className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none" >
                            <span><img src={logo} height='41' width='41'
                            alt='.' /></span>
                            <p className='d-none d-sm-inline'>Victoriautos</p>
                            </a>
                            <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
                                <li className="nav-item">
                                    <button className="nav-link align-middle px-0" onClick={() => navigate("./home")}>{HomeIcon} <span className="ms-1 d-none d-sm-inline">Home</span></button>                                    
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link align-middle px-0" onClick={() => navigate("./negocios")}>{HandShakeIcon} <span className="ms-2 d-none d-sm-inline"> Negocios</span></button>
                                </li>
                                <li>
                                    <a href="#submenu1" data-bs-toggle="collapse" className="nav-link px-0 align-middle">
                                        {DashboardIcon} <span className="ms-1 d-none d-sm-inline">Dashboard</span></a>
                                </li>
                                <li>
                                    <button className="nav-link align-middle px-0" onClick={() => navigate("./tramites")}>{FolderOpenIcon} <span className="ms-1 d-none d-sm-inline">Tramites</span></button>                                            
                                </li>
                                <li>
                                    <a href="#submenu2" data-bs-toggle="collapse" className="nav-link px-0 align-middle ">
                                        <i className="fs-4 bi-bootstrap"></i>{CarIcon} <span className="ms-1 d-none d-sm-inline">Vehiculos</span></a>
                                    <ul className="collapse nav flex-column ms-1" id="submenu2" data-bs-parent="#menu">
                                        <li className="w-100">
                                            <button className="nav-link align-middle px-0" onClick={() => navigate("./vitrina")}><span className="ms-1 d-sm-inline">{AlmacenIcon} En Vitrina</span></button>                                    
                                        </li>
                                        <li>
                                            <button className="nav-link align-middle px-0" onClick={() => navigate("./ofertas")}><span className="ms-1 d-sm-inline">{OfertaIcon} Ofertados</span></button>                                    
                                        </li>
                                    </ul>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link align-middle px-0" onClick={() => navigate("./buscado")}>
                                        <span className="material-symbols-outlined">interests</span>
                                        <span className="ms-2 d-none d-sm-inline">Intereses</span>
                                    </button>
                                </li>
                                <li>
                                    <a href="#submenu3" data-bs-toggle="collapse" className="nav-link px-0 align-middle">
                                        <i className="fs-4 bi-grid"></i>{UsuariosIcon} <span className="ms-1 d-none d-sm-inline">Usuarios</span> </a>
                                        <ul className="collapse nav flex-column ms-1" id="submenu3" data-bs-parent="#menu">
                                        <li className="w-100">
                                            <a href="/#" className="nav-link px-0"> <span className="d-none d-sm-inline">Clientes</span></a>
                                        </li>
                                        <li>
                                            <a href="/#" className="nav-link px-0"> <span className="d-none d-sm-inline">Trabajadores</span></a>
                                        </li>

                                    </ul>
                                </li>

                            </ul>
                            <hr/>
                            <div className="dropdown pb-4">
                                <a href="/#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img src="" alt="" width="30" height="30" className="rounded-circle"/>
                                    <span className="d-none d-sm-inline mx-1">
                                        {/* {username} */}
                                    </span>
                                </a>
                                <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
                                    <li><a className="dropdown-item" href="/#">New project...</a></li>
                                    <li><a className="dropdown-item" href="/#">Settings</a></li>
                                    <li><a className="dropdown-item" href="/#">Profile</a></li>
                                    <li>
                                        <hr className="dropdown-divider"/>
                                    </li>
                                    {/* //logout button */}
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

    //if location is different than /admin or /admin/ then return null
    if (location.pathname !== "/admin" && location.pathname !== "/admin/") {
    
        return null;
    }
    else {
    return (
        <div className='container'>
            <div className='row'>
                <div className='col-12'>
                </div>
            </div>

        </div>
    );
    }
}

function AdminComponent() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Redirect to dashboard if on /admin or /admin/
        if (location.pathname === '/admin' || location.pathname === '/admin/') {
            navigate('/admin/dashboard');
        }
    }, [location, navigate]);

    // const ofertas = useSelector(state => state.ofertas.ofertas);

    return (
        <React.Fragment>
            <Sidebar />
        </React.Fragment>
    );
}

//export using connect from react-redux
export default AdminComponent;