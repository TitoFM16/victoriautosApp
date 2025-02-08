import { useState, useEffect } from 'react';

import axios from 'axios';

const BuscadoComponent = () => {
    const [interesForms, setInteresForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingForm, setEditingForm] = useState(null);
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

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro que desea eliminar este registro?')) {
            try {
                await axios.delete(`/api/interescompra/${id}`);
                setInteresForms(prevForms => prevForms.filter(form => form._id !== id));
            } catch (error) {
                console.error('Error deleting record:', error);
            }
        }
    };

    const handleEdit = (form) => {
        setEditingForm({ ...form });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveEdit = async () => {
        try {
            const response = await axios.put(`/api/interescompra/${editingForm._id}`, editingForm);
            setInteresForms(prevForms => 
                prevForms.map(form => 
                    form._id === editingForm._id ? response.data : form
                )
            );
            setEditingForm(null);
        } catch (error) {
            console.error('Error updating record:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingForm(null);
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
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredForms.map((form, index) => (
                                <tr key={index}>
                                    {editingForm && editingForm._id === form._id ? (
                                        <>
                                            <td><input type="text" className="form-control form-control-sm" name="nombre" value={editingForm.nombre} onChange={handleEditChange} /></td>
                                            <td><input type="text" className="form-control form-control-sm" name="apellido" value={editingForm.apellido} onChange={handleEditChange} /></td>
                                            <td><input type="text" className="form-control form-control-sm" name="celular" value={editingForm.celular} onChange={handleEditChange} /></td>
                                            <td><input type="email" className="form-control form-control-sm" name="email" value={editingForm.email} onChange={handleEditChange} /></td>
                                            <td><input type="text" className="form-control form-control-sm" name="marca" value={editingForm.marca} onChange={handleEditChange} /></td>
                                            <td><input type="text" className="form-control form-control-sm" name="linea" value={editingForm.linea} onChange={handleEditChange} /></td>
                                            <td><input type="text" className="form-control form-control-sm" name="modelo" value={editingForm.modelo} onChange={handleEditChange} /></td>
                                            <td><input type="number" className="form-control form-control-sm" name="km" value={editingForm.km} onChange={handleEditChange} /></td>
                                            <td><input type="number" className="form-control form-control-sm" name="price" value={editingForm.price} onChange={handleEditChange} /></td>
                                            <td>
                                                <div className="btn-group">
                                                    <button className="btn btn-success btn-sm" onClick={handleSaveEdit}>
                                                        Guardar
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{form.nombre}</td>
                                            <td>{form.apellido}</td>
                                            <td>{form.celular}</td>
                                            <td>{form.email}</td>
                                            <td>{form.marca}</td>
                                            <td>{form.linea}</td>
                                            <td>{form.modelo}</td>
                                            <td>{form.km}</td>
                                            <td>${form.price}</td>
                                            <td>
                                                <div className="btn-group">
                                                    <button 
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleEdit(form)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(form._id)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
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
