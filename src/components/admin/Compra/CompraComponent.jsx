import { useState, useEffect } from 'react';
import { Card, CardBody } from 'reactstrap';
import axios from 'axios';
import LoadingComponent from '../../shared/loadingComponent';

const CompraComponent = () => {
    const [compraForms, setCompraForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generatingPdf, setGeneratingPdf] = useState({});

    useEffect(() => {
        fetchCompraForms();
    }, []);

    const fetchCompraForms = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/compra', {
                withCredentials: true
            });
            setCompraForms(response.data);
        } catch (error) {
            console.error('Error fetching compra forms:', error);
            setError('Error al cargar las formas de compra');
        } finally {
            setLoading(false);
        }
    };

    const generateContract = async (compraFormId) => {
        try {
            setGeneratingPdf(prev => ({ ...prev, [compraFormId]: true }));
            
            const response = await axios.get(`/api/compra/generate-pdf/${compraFormId}`, {
                responseType: 'blob',
                withCredentials: true
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Get compra form details for filename
            const compraForm = compraForms.find(form => form._id === compraFormId);
            const filename = `Contrato_${compraForm?.nombre}_${compraForm?.apellido}_${compraForm?.car?.marca}_${compraForm?.car?.linea}.pdf`;
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error al generar el contrato. Por favor intente nuevamente.');
        } finally {
            setGeneratingPdf(prev => ({ ...prev, [compraFormId]: false }));
        }
    };

    const formatMoney = (value) => {
        return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : 'N/A';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-12 text-center py-5">
                        <LoadingComponent />
                        <p className="mt-3">Cargando formas de compra...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="mb-0">
                            <span className="material-symbols-outlined me-2" style={{verticalAlign: 'middle'}}>shopping_cart</span>
                            Solicitudes de Compra
                        </h2>
                        <button 
                            className="btn btn-outline-primary"
                            onClick={fetchCompraForms}
                        >
                            <span className="material-symbols-outlined me-1">refresh</span>
                            Actualizar
                        </button>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <Card>
                        <CardBody>
                            {compraForms.length === 0 ? (
                                <div className="text-center py-4">
                                    <span className="material-symbols-outlined" style={{fontSize: '4rem', color: '#6c757d'}}>inbox</span>
                                    <p className="text-muted mt-2">No hay solicitudes de compra pendientes</p>
                                </div>
                            ) : (
                                <>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="card-title mb-0">
                                            Total de solicitudes: <span className="badge bg-primary">{compraForms.length}</span>
                                        </h5>
                                    </div>
                                    
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th scope="col">Cliente</th>
                                                    <th scope="col">Contacto</th>
                                                    <th scope="col">Vehículo</th>
                                                    <th scope="col">Precio</th>
                                                    <th scope="col">Fecha</th>
                                                    <th scope="col">Estado</th>
                                                    <th scope="col">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {compraForms.map((form) => (
                                                    <tr key={form._id}>
                                                        <td>
                                                            <div>
                                                                <strong>{form.nombre} {form.apellido}</strong>
                                                                <br />
                                                                <small className="text-muted">CC: {form.cedula}</small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <span className="text-primary">{form.celular}</span>
                                                                <br />
                                                                <small className="text-muted">{form.email}</small>
                                                                {form.wppCheck && (
                                                                    <span className="badge bg-success ms-1">WhatsApp</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {form.car ? (
                                                                <div>
                                                                    <strong>{form.car.marca} {form.car.linea}</strong>
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        Modelo {form.car.modelo} • {form.car.km ? formatMoney(form.car.km) : 'N/A'} km
                                                                    </small>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted">Vehículo no disponible</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <strong className="text-success">
                                                                ${form.car ? formatMoney(form.car.price) : 'N/A'}
                                                            </strong>
                                                        </td>
                                                        <td>
                                                            <small>{formatDate(form.createdAt)}</small>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${
                                                                form.status === 'PENDING' ? 'bg-warning' :
                                                                form.status === 'APPROVED' ? 'bg-success' :
                                                                form.status === 'REJECTED' ? 'bg-danger' : 'bg-secondary'
                                                            }`}>
                                                                {form.status === 'PENDING' ? 'Pendiente' :
                                                                 form.status === 'APPROVED' ? 'Aprobado' :
                                                                 form.status === 'REJECTED' ? 'Rechazado' : form.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="btn-group">
                                                                <button
                                                                    className="btn btn-primary btn-sm"
                                                                    onClick={() => generateContract(form._id)}
                                                                    disabled={generatingPdf[form._id] || !form.car}
                                                                >
                                                                    {generatingPdf[form._id] ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                            Generando...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="material-symbols-outlined me-1" style={{fontSize: '16px'}}>description</span>
                                                                            Generar Contrato
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    className="btn btn-success btn-sm"
                                                                    onClick={() => window.open(`https://api.whatsapp.com/send?phone=57${form.celular}&text=Hola ${form.nombre}, hemos recibido tu solicitud de compra para el vehículo ${form.car?.marca} ${form.car?.linea}. Te contactaremos pronto.`, "_blank")}
                                                                >
                                                                    <span className="material-symbols-outlined" style={{fontSize: '16px'}}>chat</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>

            {compraForms.length > 0 && (
                <div className="row mt-4">
                    <div className="col-12">
                        <Card>
                            <CardBody>
                                <h5 className="card-title mb-3">
                                    <span className="material-symbols-outlined me-2" style={{verticalAlign: 'middle'}}>analytics</span>
                                    Resumen de Solicitudes
                                </h5>
                                <div className="row">
                                    <div className="col-md-3 text-center">
                                        <h3 className="text-primary">{compraForms.length}</h3>
                                        <small className="text-muted">Total de solicitudes</small>
                                    </div>
                                    <div className="col-md-3 text-center">
                                        <h3 className="text-warning">
                                            {compraForms.filter(form => form.status === 'PENDING').length}
                                        </h3>
                                        <small className="text-muted">Pendientes</small>
                                    </div>
                                    <div className="col-md-3 text-center">
                                        <h3 className="text-info">
                                            {compraForms.filter(form => form.car).length}
                                        </h3>
                                        <small className="text-muted">Con vehículo válido</small>
                                    </div>
                                    <div className="col-md-3 text-center">
                                        <h3 className="text-success">
                                            {compraForms.filter(form => form.wppCheck).length}
                                        </h3>
                                        <small className="text-muted">Con WhatsApp</small>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompraComponent; 