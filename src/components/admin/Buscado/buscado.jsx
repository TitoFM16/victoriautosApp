import React, { useState, useEffect } from 'react';

import axios from 'axios';

const BuscadoComponent = () => {
    const [interesForms, setInteresForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        marca: '',
        linea: '',
        modelo: ''
    });

    useEffect(() => {
        fetchInteresForms();
    }, []);

    const fetchInteresForms = async () => {
        try {
            const response = await axios.get('/api/interescompra');
            setInteresForms(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching interes forms:', error);
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
    };

    const filteredForms = interesForms.filter(form => {
        return (
            (filters.marca === '' || form.marca.toLowerCase().includes(filters.marca.toLowerCase())) &&
            (filters.linea === '' || form.linea.toLowerCase().includes(filters.linea.toLowerCase())) &&
            (filters.modelo === '' || form.modelo.toString().includes(filters.modelo))
        );
    });

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <h3>Interesados</h3>
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
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Celular</th>
                                <th>Email</th>
                                <th>Marca</th>
                                <th>Linea</th>
                                <th>Modelo</th>
                                <th>KM</th>
                                <th>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredForms.map((form, index) => (
                                <tr key={index}>
                                    <td>{form.nombre}</td>
                                    <td>{form.apellido}</td>
                                    <td>{form.celular}</td>
                                    <td>{form.email}</td>
                                    <td>{form.marca}</td>
                                    <td>{form.linea}</td>
                                    <td>{form.modelo}</td>
                                    <td>{form.km}</td>
                                    <td>${form.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BuscadoComponent;
