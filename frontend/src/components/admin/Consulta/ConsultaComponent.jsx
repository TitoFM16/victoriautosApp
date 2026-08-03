import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Spinner } from 'react-bootstrap';

const ConsultaComponent = () => {
  const [placa, setPlaca] = useState('');
  const [simitLoading, setSimitLoading] = useState(false);
  const [fasecoldaLoading, setFasecoldaLoading] = useState(false);
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
  
  // Individual API call for SIMIT
  const fetchSimitData = async (plateNumber) => {
    setSimitLoading(true);
    try {
      const response = await fetch('https://simit-api.onrender.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_number: plateNumber }),
      });
      
      const result = await response.json();
      setSimitData(result);
    } catch (err) {
      console.error('SIMIT API Error:', err);
      setSimitData({ error: 'Error al consultar SIMIT' });
    } finally {
      setSimitLoading(false);
    }
  };

  // Individual API call for FASECOLDA
  const fetchFasecoldaData = async (plateNumber) => {
    setFasecoldaLoading(true);
    try {
      const response = await fetch('https://fasecolda-api.onrender.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placa: plateNumber }),
      });
      
      const result = await response.json();
      setFasecoldaData(result);
    } catch (err) {
      console.error('FASECOLDA API Error:', err);
      setFasecoldaData({ error: 'Error al consultar FASECOLDA' });
    } finally {
      setFasecoldaLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!placa.trim()) {
      setError('Por favor ingrese una placa válida');
      return;
    }

    const plateNumber = placa.trim().toUpperCase();
    
    // Reset state
    setError('');
    setSimitData(null);
    setFasecoldaData(null);

    // Start both API calls independently - they will render as they complete
    fetchSimitData(plateNumber);
    fetchFasecoldaData(plateNumber);
  };

  const renderSimitResults = () => {
    // Show loading state
    if (simitLoading) {
      return (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Consulta SIMIT - Multas de Tránsito</h5>
          </Card.Header>
          <Card.Body className="text-center">
            <Spinner animation="border" role="status" className="me-2" />
            <span>Consultando SIMIT...</span>
          </Card.Body>
        </Card>
      );
    }

    // Don't render anything if no data yet
    if (!simitData) return null;

    // Handle API error
    if (simitData.error) {
      return (
        <Alert variant="danger">
          <strong>SIMIT:</strong> {simitData.error}
        </Alert>
      );
    }

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
    // Show loading state
    if (fasecoldaLoading) {
      return (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Consulta FASECOLDA - Historial de Siniestros</h5>
          </Card.Header>
          <Card.Body className="text-center">
            <Spinner animation="border" role="status" className="me-2" />
            <span>Consultando FASECOLDA...</span>
          </Card.Body>
        </Card>
      );
    }

    // Don't render anything if no data yet
    if (!fasecoldaData) return null;

    // Handle API error
    if (fasecoldaData.error) {
      return (
        <Alert variant="danger">
          <strong>FASECOLDA:</strong> {fasecoldaData.error}
        </Alert>
      );
    }

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

  // Check if any API is currently loading
  const isAnyLoading = simitLoading || fasecoldaLoading;
  
  // Check if we should show results section
  const shouldShowResults = simitData || fasecoldaData || isAnyLoading;

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
                        disabled={isAnyLoading}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={isAnyLoading}
                      className="mb-3 w-100"
                    >
                      {isAnyLoading ? (
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

          {shouldShowResults && (
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