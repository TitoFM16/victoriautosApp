// this component is to show the list of negocios in the admin page doing a get request to the server endpoint /admin/match
// there are two types of negocios, the ones done with the vitrina cars and the ones done with the Ofertas 
// the endpoint returns two arrays, one with the negocios done with vitrina cars and the other with the negocios done with ofertas
// the difference is that the negocios done with vitrina cars have a carId and the negocios done with ofertas cars have an ofertaId
// and also that the negocios done with vitrina cars just have the information of the car(marca, linea, modelo) in the car object, and
// the contact information of the buyer in the interes object 
// but with the negocios done with ofertas is necessary to also render the contact information of the both users
// seller and buyer, seller information is on the oferta object (nombre, apellido, celular, email) and the buyer information is on the interes object
// (nombre, apellido, celular, email)


import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';


const NegociosComponent = () => {
    const [loading, setLoading] = useState(true);
    const [negociosVitrina, setNegociosVitrina] = useState([]);
    const [negociosOferta, setNegociosOferta] = useState([]);
    const [activeTab, setActiveTab] = useState('vitrina');
    const [filters, setFilters] = useState({
        marca: '',
        linea: '',
        modelo: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/admin/match', {
                    withCredentials: true
                });
                setNegociosVitrina(response.data.carsMatch);
                setNegociosOferta(response.data.carsMatchOferta);
            } catch (error) {
                console.error(error.message);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
    };

    const filteredVitrina = negociosVitrina.filter(negocio => {
        return (
            (filters.marca === '' || negocio.car.marca.toLowerCase().includes(filters.marca.toLowerCase())) &&
            (filters.linea === '' || negocio.car.linea.toLowerCase().includes(filters.linea.toLowerCase())) &&
            (filters.modelo === '' || negocio.car.modelo.toString().includes(filters.modelo))
        );
    });

    const filteredOferta = negociosOferta.filter(negocio => {
        return (
            (filters.marca === '' || negocio.oferta.marca.toLowerCase().includes(filters.marca.toLowerCase())) &&
            (filters.linea === '' || negocio.oferta.linea.toLowerCase().includes(filters.linea.toLowerCase())) &&
            (filters.modelo === '' || negocio.oferta.modelo.toString().includes(filters.modelo))
        );
    });

    const eliminarNegocio = (id) => {
        axios.delete('/api/negocios/' + id)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.log(error);
            })
        setNegociosVitrina(negociosVitrina.filter(el => el._id !== id));
    }

    const renderVitrinaCard = (negocio, index) => (
        <div key={index} className="card mb-3">
            <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Información del Vehículo</h6>
                <p className="mb-1"><strong>Marca:</strong> {negocio.car.marca}</p>
                <p className="mb-1"><strong>Linea:</strong> {negocio.car.linea}</p>
                <p className="mb-2"><strong>Modelo:</strong> {negocio.car.modelo}</p>
                
                <h6 className="card-subtitle mb-2 text-muted">Información del Comprador</h6>
                <p className="mb-1"><strong>Nombre:</strong> {negocio.interes.nombre} {negocio.interes.apellido}</p>
                <p className="mb-1"><strong>Celular:</strong> {negocio.interes.celular}</p>
                <p className="mb-2"><strong>Email:</strong> {negocio.interes.email}</p>
                
                <div className="d-flex gap-2">
                    <Link to={"/admin/negocios/edit/" + negocio._id} className="btn btn-sm btn-primary">Editar</Link>
                    <button className="btn btn-sm btn-danger" onClick={() => eliminarNegocio(negocio._id)}>Eliminar</button>
                </div>
            </div>
        </div>
    );

    const renderOfertaCard = (negocio, index) => (
        <div key={index} className="card mb-3">
            <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Información del Vehículo</h6>
                <p className="mb-1"><strong>Marca:</strong> {negocio.oferta.marca}</p>
                <p className="mb-1"><strong>Linea:</strong> {negocio.oferta.linea}</p>
                <p className="mb-2"><strong>Modelo:</strong> {negocio.oferta.modelo}</p>
                
                <h6 className="card-subtitle mb-2 text-muted">Información del Vendedor</h6>
                <p className="mb-1"><strong>Nombre:</strong> {negocio.oferta.nombre} {negocio.oferta.apellido}</p>
                <p className="mb-1"><strong>Celular:</strong> {negocio.oferta.celular}</p>
                <p className="mb-2"><strong>Email:</strong> {negocio.oferta.email}</p>
                
                <h6 className="card-subtitle mb-2 text-muted">Información del Comprador</h6>
                <p className="mb-1"><strong>Nombre:</strong> {negocio.interes.nombre} {negocio.interes.apellido}</p>
                <p className="mb-1"><strong>Celular:</strong> {negocio.interes.celular}</p>
                <p className="mb-2"><strong>Email:</strong> {negocio.interes.email}</p>
                
                <div className="d-flex gap-2">
                    <Link to={"/admin/negocios/edit/" + negocio._id} className="btn btn-sm btn-primary">Editar</Link>
                    <button className="btn btn-sm btn-danger" onClick={() => eliminarNegocio(negocio._id)}>Eliminar</button>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="container-fluid px-3 py-4">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-3 py-4">
            <div className="row">
                <div className="col-12">
                    <h3 className="mb-4">Negocios</h3>
                    
                    {/* Tabs */}
                    <div className="d-flex justify-content-start mb-4">
                        <div className="compra-venta-buttons-group w-100" role="group">
                            <button
                                className={`btn ${activeTab === 'vitrina' ? 'selected-button-form' : 'unselected-button-form'} m-0 p-2 flex-grow-1`}
                                onClick={() => setActiveTab('vitrina')}
                            >
                                <span className="material-symbols-outlined">store</span>
                                <span className="ms-1">En Vitrina</span>
                            </button>
                            <button
                                className={`btn ${activeTab === 'ofertas' ? 'selected-button-form' : 'unselected-button-form'} m-0 p-2 flex-grow-1`}
                                onClick={() => setActiveTab('ofertas')}
                            >
                                <span className="material-symbols-outlined">sell</span>
                                <span className="ms-1">Ofertados</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="row g-3 mb-4">
                        <div className="col-12 col-sm-6 col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filtrar por marca"
                                name="marca"
                                value={filters.marca}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filtrar por linea"
                                name="linea"
                                value={filters.linea}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filtrar por modelo"
                                name="modelo"
                                value={filters.modelo}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="row">
                        <div className="col-12">
                            {/* Desktop View */}
                            <div className="d-none d-lg-block">
                                {activeTab === 'vitrina' ? (
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Marca</th>
                                                    <th>Linea</th>
                                                    <th>Modelo</th>
                                                    <th>Nombre Comprador</th>
                                                    <th>Apellido</th>
                                                    <th>Celular</th>
                                                    <th>Email</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredVitrina.map((negocio, i) => (
                                                    <tr key={i}>
                                                        <td>{negocio.car.marca}</td>
                                                        <td>{negocio.car.linea}</td>
                                                        <td>{negocio.car.modelo}</td>
                                                        <td>{negocio.interes.nombre}</td>
                                                        <td>{negocio.interes.apellido}</td>
                                                        <td>{negocio.interes.celular}</td>
                                                        <td>{negocio.interes.email}</td>
                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <Link to={"/admin/negocios/edit/" + negocio._id} className="btn btn-sm btn-primary">Editar</Link>
                                                                <button className="btn btn-sm btn-danger" onClick={() => eliminarNegocio(negocio._id)}>Eliminar</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Marca</th>
                                                    <th>Linea</th>
                                                    <th>Modelo</th>
                                                    <th>Nombre Vendedor</th>
                                                    <th>Apellido</th>
                                                    <th>Celular</th>
                                                    <th>Email</th>
                                                    <th>Nombre Comprador</th>
                                                    <th>Apellido</th>
                                                    <th>Celular</th>
                                                    <th>Email</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOferta.map((negocio, i) => (
                                                    <tr key={i}>
                                                        <td>{negocio.oferta.marca}</td>
                                                        <td>{negocio.oferta.linea}</td>
                                                        <td>{negocio.oferta.modelo}</td>
                                                        <td>{negocio.oferta.nombre}</td>
                                                        <td>{negocio.oferta.apellido}</td>
                                                        <td>{negocio.oferta.celular}</td>
                                                        <td>{negocio.oferta.email}</td>
                                                        <td>{negocio.interes.nombre}</td>
                                                        <td>{negocio.interes.apellido}</td>
                                                        <td>{negocio.interes.celular}</td>
                                                        <td>{negocio.interes.email}</td>
                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <Link to={"/admin/negocios/edit/" + negocio._id} className="btn btn-sm btn-primary">Editar</Link>
                                                                <button className="btn btn-sm btn-danger" onClick={() => eliminarNegocio(negocio._id)}>Eliminar</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Mobile View */}
                            <div className="d-block d-lg-none">
                                {activeTab === 'vitrina' ? (
                                    filteredVitrina.map((negocio, i) => renderVitrinaCard(negocio, i))
                                ) : (
                                    filteredOferta.map((negocio, i) => renderOfertaCard(negocio, i))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NegociosComponent;