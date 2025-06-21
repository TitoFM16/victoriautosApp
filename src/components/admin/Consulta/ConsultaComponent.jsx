import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Spinner } from 'react-bootstrap';

const ConsultaComponent = () => {
    const [placa, setPlaca] = useState('');
    const [loading, setLoading] = useState(false);
    const [simitData, setSimitData] = useState(null);
    const [fasecoldaData, setFasecoldaData] = useState(null);
    const [error, setError] = useState('');

    const fixEncoding = (str) => {
        try {
            return new TextDecoder('utf-8').decode(
                new Uint8Array([...str].map(char => char.charCodeAt(0)))
            );
        } catch {
            return str; // fallback to original if decoding fails
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!placa.trim()) {
            setError('Por favor ingrese una placa válida');
            return;
        }

        setLoading(true);
        setError('');
        setSimitData(null);
        setFasecoldaData(null);

        try {
            // Launch both requests without waiting
            const simitPromise = fetch('https://simit-api.onrender.com/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ document_number: placa.trim().toUpperCase() }),
            });

            const fasecoldaPromise = fetch('https://fasecolda-api.onrender.com/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ placa: placa.trim().toUpperCase() }),
            });

            // Process Simit first
            simitPromise.then(async (res) => {
                const result = await res.json();
                setSimitData(result);
            }).catch((err) => {
                console.error('SIMIT error:', err);
                setSimitData({ has_tickets: false, message: 'Error al consultar SIMIT' });
            });

            // Then Fasecolda
            fasecoldaPromise.then(async (res) => {
                const result = await res.json();
                setFasecoldaData(result);
            }).catch((err) => {
                console.error('FASECOLDA error:', err);
                setFasecoldaData({ result_type: 'NO_RESULTS', records: [], message: 'Error al consultar Fasecolda' });
            });
        } catch (err) {
            setError('Error al iniciar las consultas.');
            console.error('API Error:', err);
        }
        finally {
            setLoading(false);
        }
    };

    const renderSimitResults = () => {
        if (!simitData) return null;

        // Check for service unavailable
        if (!simitData.has_tickets && simitData.message &&
            simitData.message.includes('No clear results found. The website may have changed or is not')) {
            return (
                <Alert variant="warning">
                    <strong>SIMIT:</strong> Servicio simit no disponible
                </Alert>
            );
        }

        // No tickets found
        if (!simitData.has_tickets) {
            return (
                <Alert variant="success">
                    <strong>SIMIT:</strong> No hay multas registradas para esta placa
                </Alert>
            );
        }

        // Has tickets - render table
        return (
            <Card className="mb-4">
                <Card.Header>
                    <h5 className="mb-0">Consulta SIMIT - Multas de Tránsito</h5>
                    <small className="text-muted">{simitData.message}</small>
                </Card.Header>
                <Card.Body>
                    <div className="table-responsive">
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Placa</th>
                                    <th>Secretaría</th>
                                    <th>Infracción</th>
                                    <th>Estado</th>
                                    <th>Valor</th>
                                    <th>Valor a Pagar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {simitData.tickets.map((ticket, index) => (
                                    <tr key={index}>
                                        <td>{ticket.Tipo || 'N/A'}</td>
                                        <td>{ticket.Placa || 'N/A'}</td>
                                        <td>{ticket.Secretaría || 'N/A'}</td>
                                        <td>{ticket.Infracción || 'N/A'}</td>
                                        <td>{ticket.Estado || 'N/A'}</td>
                                        <td>{ticket.Valor || 'N/A'}</td>
                                        <td>{ticket['Valor a pagar'] || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        );
    };

    const renderFasecoldaResults = () => {
        if (!fasecoldaData) return null;

        // No records found
        if (fasecoldaData.result_type !== 'HAS_RESULTS' || !fasecoldaData.records || fasecoldaData.records.length === 0) {
            return (
                <Alert variant="success">
                    <strong>FASECOLDA:</strong> No hay registros de siniestros para esta placa
                </Alert>
            );
        }

        // Has records - render table
        return (
            <Card className="mb-4">
                <Card.Header>
                    <h5 className="mb-0">Consulta FASECOLDA - Historial de Siniestros</h5>
                    <small className="text-muted">
                        {fasecoldaData.message} - Fecha de consulta: {new Date(fasecoldaData.search_date).toLocaleString()}
                    </small>
                </Card.Header>
                <Card.Body>
                    <div className="table-responsive">
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo de Siniestro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fasecoldaData.records.map((record, index) => (
                                    <tr key={index}>
                                        <td>{record.fecha || 'N/A'}</td>
                                        <td>{fixEncoding(record.tipo_siniestro) || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        );
    };

    return (
        <Container fluid className="py-4">
            <Row>
                <Col>
                    <h2 className="mb-4">Consulta de Placa</h2>

                    <Card className="mb-4">
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={8}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Número de Placa</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Ingrese el número de placa (ej: ABC123)"
                                                value={placa}
                                                onChange={(e) => setPlaca(e.target.value)}
                                                disabled={loading}
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4} className="d-flex align-items-end">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={loading}
                                            className="mb-3 w-100"
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-2"
                                                    />
                                                    Consultando...
                                                </>
                                            ) : (
                                                'Consultar'
                                            )}
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>

                    {error && (
                        <Alert variant="danger" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {(simitData || fasecoldaData) && (
                        <Row>
                            <Col>
                                <h4 className="mb-3">Resultados para la placa: {placa.toUpperCase()}</h4>
                                {renderSimitResults()}
                                {renderFasecoldaResults()}
                            </Col>
                        </Row>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default ConsultaComponent; 