import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

import axios from 'axios';

import {Col, Row,Container} from 'reactstrap'
// import {Link} from 'react-router-dom'

function FormStep2(props) {
    
    const [marca, setMarca] = useState(props.marca || "");
    const [, setLinea] = useState(props.linea || "");
    const [marcaDropdown, setMarcaDropdown] = useState([]);
    const [lineaDropdown, setLineaDropdown] = useState([]);
    const tipo = 'all'; // Constant tipo 'all'
  
    const validateModelo = (value) => {
        const currentYear = new Date().getFullYear();
        const year = parseInt(value);
        return year >= 1920 && year <= currentYear + 1;
    };

    const validateKilometraje = (value) => {
        const km = parseInt(value.replace(/\D/g, ''));
        return !isNaN(km) && km >= 0 && km < 10000000;
    };

    const validatePrecio = (value) => {
        const precio = parseInt(value.replace(/\D/g, ''));
        return !isNaN(precio) && precio > 0 && precio < 100000000000;
    };

    const formatPrice = (value) => {
        const number = parseInt(value.replace(/\D/g, ''));
        if (!isNaN(number)) {
            return `$ ${number.toLocaleString('es-CO')}`;
        }
        return value;
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        
        if (name === 'modelo') {
            // Only allow numbers and limit to 4 digits
            const numericValue = value.replace(/\D/g, '').slice(0, 4);
            props.handleChange({
                target: { name, value: numericValue }
            });
        } else if (name === 'km') {
            // Only allow numbers and limit to 7 digits
            const numericValue = value.replace(/\D/g, '').slice(0, 7);
            props.handleChange({
                target: { name, value: numericValue }
            });
        } else if (name === 'price') {
            // Remove any non-numeric characters and format
            const numericValue = value.replace(/\D/g, '');
            props.handleChange({
                target: { name, value: numericValue }
            });
        } else {
            props.handleChange(event);
        }
    };

    // Initial fetch for marcas
    useEffect(() => {
        axios
            .get('/api/buscavehiculo/?tipo=' + tipo)
            .then((response) => {
                setMarcaDropdown(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    // Effect to fetch lineas when marca is pre-filled
    useEffect(() => {
        if (props.marca) {
            axios
                .get('/api/buscavehiculo/?tipo=' + tipo + '&marca=' + props.marca)
                .then((response) => {
                    setLineaDropdown(response.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [props.marca]);
    

    // Wrapper function to handle marca change and keep props.handleChange intact
    const handleMarcaChange = (event) => {
        const value = event.target.value;
    
        // Call the provided props.handleChange to not disrupt existing functionality
        props.handleChange(event);
    
        // Custom logic for handling marca change
        if (event.target.name === 'marca') {
            setMarca(value);
      
        // Make axios request to get linea options based on selected marca
        axios
            .get('/api/buscavehiculo/?tipo=' + tipo + '&marca=' + value)
            .then((response) => {
            setLineaDropdown(response.data); // Set the linea options from server
        })
            .catch((error) => {
          console.log(error);
        });
    }
    
    };
    // Wrapper function to handle linea change and keep props.handleChange intact
    const handleLineaChange = (event) => {
        const value = event.target.value;
    
        // Call the provided props.handleChange to not disrupt existing functionality
        props.handleChange(event);
    
        // Custom logic for handling marca change
        if (event.target.name === 'linea') {
            setLinea(value);
    }
    
    };
    
  return(


            <Container className="vende-form-container py-2 mb-2 border-in-container shadow">
                <Row className='align-items-center justify-content-center'>
                    <Col md={6} sm={12} className="form-box-spacer">
                        <div className="form-group">
                            <label className = "left-label-position" htmlFor="marca">Marca del vehículo</label>
                            <select
                                className="form-control"
                                id="marca"
                                name="marca"
                                value={props.marca}
                                onChange={handleMarcaChange}
                            >
                                <option value=''>Marca</option>
                                {tipo !== '' ? marcaDropdown
                                    .sort((a, b) => a.marca.localeCompare(b.marca)) // Sort alphabetically by the "marca" field
                                    .map((marca) => {
                                        return (
                                            <option key={marca.id} value={marca.marca}>{marca.marca}</option>
                                        );
                                    }) : null}
                            </select>
                        </div>
                    </Col>
                    <Col md={6} sm={12} className="form-box-spacer" >
                        <div className="form-group">
                            <label className = "left-label-position" htmlFor="linea">Linea del vehiculo</label>                    
                            <select
                                className="form-control"
                                id="linea"
                                name="linea"
                                value={props.linea}
                                onChange={handleLineaChange}
                            >
                                <option value=''>Linea</option>
                                {marca !== '' ? lineaDropdown
                                    .sort((a, b) => (a.linea + ' ' + (a.version || '')).localeCompare(b.linea + ' ' + (b.version || '')))
                                    .map((linea) => {
                                        return (
                                            <option key={linea.id} value={linea.linea + ' ' + (linea.version || '')}>
                                                {linea.linea + ' ' + (linea.version || '')}
                                            </option>
                                        );
                                    }) : null}

                            </select>
                        </div>
                    </Col>
                </Row>
                <Row className='align-items-center justify-content-center'>
                    <Col md={6} sm={12} className="form-box-spacer">
                        <div className="form-group">
                            <label className = "left-label-position" htmlFor="modelo">Modelo (Año)</label>
                            <input
                                className={`form-control ${props.modelo && !validateModelo(props.modelo) ? 'is-invalid' : ''}`}
                                id="modelo"
                                name="modelo"
                                type="text"
                                placeholder="Ej: 2020"
                                value={props.modelo}
                                onChange={handleInputChange}
                            />
                            {props.modelo && !validateModelo(props.modelo) && (
                                <div className="invalid-feedback">
                                    El año debe ser válido
                                </div>
                            )}
                        </div>
                    </Col>
                    <Col md={6} sm={12} className="form-box-spacer">
                        <div className="form-group">
                            <label className = "left-label-position" htmlFor="km">Kilometraje</label>
                            <input
                                className={`form-control ${props.km && !validateKilometraje(props.km) ? 'is-invalid' : ''}`}
                                id="km"
                                name="km"
                                type="text"
                                placeholder="Ej: 50000"
                                value={props.km}
                                onChange={handleInputChange}
                            />
                            {props.km && !validateKilometraje(props.km) && (
                                <div className="invalid-feedback">
                                    El kilometraje debe ser menor a 10.000.000
                                </div>
                            )}
                        </div>
                    </Col>


                </Row>
                <Row className='align-items-center justify-content-center pb-2 mb-2'>
                    
                    <Col md={6} sm={12} >
                        
                        <div className="form-group">
                        <label className = "left-label-position" htmlFor="matricula" >Ciudad de matricula</label>  

                            <input
                            className="form-control"
                            id="matricula"
                            name="matricula"
                            type="text"
                            placeholder="Escribe tu ciudad de matricula"
                            value={props.matricula}
                            onChange={props.handleChange}
                            />
                        </div>
                    </Col>
                    <Col md={6} sm={12} className="form-box-spacer">
                        <div className="form-group">
                            <label className = "left-label-position" htmlFor="price">Precio del vehículo</label>
                            <input
                                className={`form-control ${props.price && !validatePrecio(props.price) ? 'is-invalid' : ''}`}
                                id="price"
                                name="price"
                                type="text"
                                placeholder="Ej: $ 50.000.000"
                                value={formatPrice(props.price)}
                                onChange={handleInputChange}
                            />
                            {props.price && !validatePrecio(props.price) && (
                                <div className="invalid-feedback">
                                    Por favor ingresa un precio razonable :)
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>



            </Container>

        );        

}

FormStep2.propTypes = {
  marca: PropTypes.string.isRequired,
  linea: PropTypes.string.isRequired,
  modelo: PropTypes.string.isRequired,
  km: PropTypes.string.isRequired,
  matricula: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired
};

export default FormStep2;