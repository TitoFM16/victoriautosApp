import React, {useEffect, useState} from 'react';

import axios from 'axios';

import {Col, Row,Container} from 'reactstrap'
// import {Link} from 'react-router-dom'

function FormStep2(props) {
    
    const [marca, setMarca] = useState(props.marca || "");
    const [linea, setLinea] = useState(props.linea || "");
    const [marcaDropdown, setMarcaDropdown] = useState([]);
    const [lineaDropdown, setLineaDropdown] = useState([]);
    const tipo = 'all'; // Constant tipo 'all'
  
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
                            <label className = "left-label-position" htmlFor="modelo">Modelo</label>
                            <input
                            className="form-control"
                            id="modelo"
                            name="modelo"
                            type="text"
                            placeholder="Escribe tu modelo"
                            value={props.modelo}
                            onChange={props.handleChange}
                            />
                        </div>
                    </Col>
                    <Col md={6} sm={12} className="form-box-spacer">
                        <div className="form-group">
                            <label className = "left-label-position" htmlFor="km">Kilometraje</label>
                            <input
                            className="form-control"
                            id="km"
                            name="km"
                            type="text"
                            placeholder="Escribe tu km"
                            value={props.km}
                            onChange={props.handleChange}
                            />
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
                            <label className = "left-label-position" htmlFor="matricula">Precio del vehículo</label>
                            <input
                            className="form-control"
                            id="price"
                            name="price"
                            type="text"
                            placeholder="Cual es el precio de tu vehículo"
                            value={props.price}
                            onChange={props.handleChange}
                            />
                        </div>
                    </Col>
                </Row>



            </Container>

        );        

}

export default FormStep2;