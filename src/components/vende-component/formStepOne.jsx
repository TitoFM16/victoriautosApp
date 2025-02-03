import React from 'react';
import {Col, Row, Container} from 'reactstrap'
import PropTypes from 'prop-types';
// import {Link} from 'react-router-dom'

function FormStep1(props) {

  return(
        

            <Container className="vende-form-container py-2 mb-2 border-in-container shadow">
                <Row className='align-items-center justify-content-center'>
                    <Col md={6} sm={12} className="form-box-spacer">
                        <div className="form-group">
                            <label className="left-label-position" htmlFor="nombre">Nombre</label>
                            <input
                            className="form-control"
                            id="nombre"
                            name="nombre"
                            type="text"
                            placeholder="Escribe tu nombre"
                            value={props.nombre}
                            onChange={props.handleChange}
                            />
                        </div>
                    </Col>
                    <Col md={6} sm={12} className="form-box-spacer">
                        <div className="form-group">
                            <label className="left-label-position" htmlFor="apellido">Apellido</label>
                            <input
                            className="form-control"
                            id="apellido"
                            name="apellido"
                            type="text"
                            placeholder="Escribe tu apellido"
                            value={props.apellido}
                            onChange={props.handleChange}
                            />
                        </div>
                    </Col>
                </Row>
                <Row className='align-items-center justify-content-center'>
                    <Col md={6} sm={12} className="form-box-spacer">
                        <div className="form-group">
                            <label className="left-label-position" htmlFor="celular">Celular</label>
                            <input
                            className="form-control"
                            id="celular"
                            name="celular"
                            type="text"
                            placeholder="Escribe tu celular"
                            value={props.celular}
                            onChange={props.handleChange}
                            />
                        </div>
                    </Col>
                    <Col md={6} sm={12} className="form-box-spacer">
                        <div className="form-group">
                            <label className="left-label-position" htmlFor="email">Email</label>
                            <input
                            className="form-control"
                            id="email"
                            name="email"
                            type="text"
                            placeholder="Escribe tu email"
                            value={props.email}
                            onChange={props.handleChange}
                            />
                        </div>
                    </Col>


                </Row>

                {/* This checkbox does not have propper align, need to fix */}
                
                <Row className='align-items-center py-2 justify-content-start'>
                    {/* checkbox allowing whatsapp communication */}
                    <Col sm={{size:10}} md={{size:10}} className="form-box-spacer">
                    <div className="form-check">
                        <input
                            className="form-check-input" 
                            id="wppCheckbox"
                            name="wppcheck" 
                            type="checkbox" 
                            defaultChecked={props.wppcheck} 
                            onChange={props.handleChange} 
                            />
                        <label className="form-check-label left-label-position-check" htmlFor="wppCheckbox">
                            ¿Aceptas comunicacion via Whatsapp?
                        </label>
                    </div>
                    </Col>
                </Row>   
            </Container>

        );        

}

FormStep1.propTypes = {
  nombre: PropTypes.string.isRequired,
  apellido: PropTypes.string.isRequired,
  celular: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  wppcheck: PropTypes.bool.isRequired,
  handleChange: PropTypes.func.isRequired
};

export default FormStep1;