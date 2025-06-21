import { useState, useEffect } from 'react';
import { Card, CardBody } from 'reactstrap';
import axios from 'axios';
import LoadingComponent from '../../shared/loadingComponent';

function Home() {
    const [loading, setLoading] = useState(true);
    const [topCars, setTopCars] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTopInterestCars();
    }, []);

    const fetchTopInterestCars = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/interescompra', {
                withCredentials: true
            });
            
            // Process the data to find top cars by interest count
            const interestData = response.data;
            const carCounts = {};
            
            // Group by marca, linea, and modelo
            interestData.forEach(interest => {
                const carKey = `${interest.marca}-${interest.linea}-${interest.modelo}`;
                if (!carCounts[carKey]) {
                    carCounts[carKey] = {
                        marca: interest.marca,
                        linea: interest.linea,
                        modelo: interest.modelo,
                        count: 0,
                        interests: []
                    };
                }
                carCounts[carKey].count++;
                carCounts[carKey].interests.push({
                    nombre: interest.nombre,
                    apellido: interest.apellido,
                    celular: interest.celular,
                    price: interest.price,
                    km: interest.km,
                    createdAt: interest.createdAt
                });
            });

            // Convert to array and sort by count (descending)
            const sortedCars = Object.values(carCounts)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5); // Get top 5

            setTopCars(sortedCars);
        } catch (error) {
            console.error('Error fetching interest data:', error);
            setError('Error al cargar los datos de interés');
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (value) => {
        return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : 'N/A';
    };

    const getAveragePrice = (interests) => {
        const prices = interests.map(i => parseInt(i.price)).filter(p => !isNaN(p));
        if (prices.length === 0) return 'N/A';
        const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        return `$${formatMoney(avg.toFixed(0))}`;
    };

    const getAverageKm = (interests) => {
        const kms = interests.map(i => parseInt(i.km)).filter(k => !isNaN(k));
        if (kms.length === 0) return 'N/A';
        const avg = kms.reduce((sum, km) => sum + km, 0) / kms.length;
        return formatMoney(avg.toFixed(0));
    };

    if (loading) {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-12 text-center py-5">
                        <LoadingComponent />
                        <p className="mt-3">Cargando estadísticas de interés...</p>
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
                        <h2 className="mb-0">Panel de Administración</h2>
                        <button 
                            className="btn btn-outline-primary"
                            onClick={fetchTopInterestCars}
                        >
                            <span className="material-symbols-outlined me-1">refresh</span>
                            Actualizar
                        </button>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <Card className="mb-4">
                        <CardBody>
                            <h4 className="card-title mb-3">
                                <span className="material-symbols-outlined me-2" style={{verticalAlign: 'middle'}}>trending_up</span>
                                Top 5 Vehículos con Mayor Interés
                            </h4>
                            {topCars.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-muted">No hay datos de interés disponibles</p>
                                </div>
                            ) : (
                                <div className="row">
                                    {topCars.map((car, index) => (
                                        <div key={`${car.marca}-${car.linea}-${car.modelo}`} className="col-lg-6 col-xl-4 mb-4">
                                            <Card className="h-100 car-card">
                                                <CardBody className="d-flex flex-column">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <span className="badge bg-primary fs-6">#{index + 1}</span>
                                                        <span className="badge bg-success fs-6">{car.count} interesados</span>
                                                    </div>
                                                    
                                                    <h5 className="card-title text-dark">
                                                        {car.marca} {car.linea}
                                                    </h5>
                                                    
                                                    <h6 className="text-muted mb-3">Modelo {car.modelo}</h6>
                                                    
                                                    <div className="row mb-3">
                                                        <div className="col-6">
                                                            <small className="text-muted">Precio promedio:</small>
                                                            <div className="fw-bold">{getAveragePrice(car.interests)}</div>
                                                        </div>
                                                        <div className="col-6">
                                                            <small className="text-muted">KM promedio:</small>
                                                            <div className="fw-bold">{getAverageKm(car.interests)} km</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-auto">
                                                        <details className="mb-2">
                                                            <summary className="btn btn-outline-secondary btn-sm w-100">
                                                                Ver contactos ({car.count})
                                                            </summary>
                                                            <div className="mt-2">
                                                                {car.interests.slice(0, 3).map((interest, idx) => (
                                                                    <div key={idx} className="d-flex justify-content-between align-items-center py-1 border-bottom">
                                                                        <small className="text-dark">
                                                                            {interest.nombre} {interest.apellido}
                                                                        </small>
                                                                        <small className="text-muted">
                                                                            {interest.celular}
                                                                        </small>
                                                                    </div>
                                                                ))}
                                                                {car.count > 3 && (
                                                                    <small className="text-muted d-block text-center mt-2">
                                                                        y {car.count - 3} más...
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </details>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>

            {topCars.length > 0 && (
                <div className="row">
                    <div className="col-12">
                        <Card>
                            <CardBody>
                                <h5 className="card-title mb-3">
                                    <span className="material-symbols-outlined me-2" style={{verticalAlign: 'middle'}}>analytics</span>
                                    Resumen Estadístico
                                </h5>
                                <div className="row">
                                    <div className="col-md-3 text-center">
                                        <h3 className="text-primary">{topCars.reduce((sum, car) => sum + car.count, 0)}</h3>
                                        <small className="text-muted">Total de interesados</small>
                                    </div>
                                    <div className="col-md-3 text-center">
                                        <h3 className="text-success">{topCars.length}</h3>
                                        <small className="text-muted">Modelos populares</small>
                                    </div>
                                    <div className="col-md-3 text-center">
                                        <h3 className="text-info">{topCars[0]?.count || 0}</h3>
                                        <small className="text-muted">Más solicitado</small>
                                    </div>
                                    <div className="col-md-3 text-center">
                                        <h3 className="text-warning">
                                            {topCars.length > 0 ? (topCars.reduce((sum, car) => sum + car.count, 0) / topCars.length).toFixed(1) : 0}
                                        </h3>
                                        <small className="text-muted">Promedio por modelo</small>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;