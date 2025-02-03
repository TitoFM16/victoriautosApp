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


const NegociosComponent = (props) => {
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

    if (loading) {
        return <div className="container">
            <div className="row">
                <div className="col-12">
                    <h3>Loading...</h3>
                </div>
            </div>
        </div>;
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <h3>Negocios</h3>
                    <div className="d-flex justify-content-start mb-3">
                        <div className="compra-venta-buttons-group" role="group">
                            <button
                                className={`btn ${activeTab === 'vitrina' ? 'selected-button-form' : 'unselected-button-form'} m-0 p-1`}
                                onClick={() => setActiveTab('vitrina')}
                            >
                                <span className="material-symbols-outlined">store</span>
                                <span className="ms-1">En Vitrina</span>
                            </button>
                            <button
                                className={`btn ${activeTab === 'ofertas' ? 'selected-button-form' : 'unselected-button-form'} m-0 p-1`}
                                onClick={() => setActiveTab('ofertas')}
                            >
                                <span className="material-symbols-outlined">sell</span>
                                <span className="ms-1">Ofertados</span>
                            </button>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filtrar por marca"
                                name="marca"
                                value={filters.marca}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filtrar por linea"
                                name="linea"
                                value={filters.linea}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-4">
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

                    {activeTab === 'vitrina' ? (
                        <div className="col-12">
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
                                                <Link to={"/admin/negocios/edit/" + negocio._id}>Editar</Link> | 
                                                <button className="btn btn-link p-0" onClick={() => eliminarNegocio(negocio._id)}>Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="col-12">
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
                                                <Link to={"/admin/negocios/edit/" + negocio._id}>Editar</Link> | 
                                                <button className="btn btn-link p-0" onClick={() => eliminarNegocio(negocio._id)}>Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NegociosComponent;