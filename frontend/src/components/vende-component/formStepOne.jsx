import {Col, Row, Container} from 'reactstrap'
import PropTypes from 'prop-types';
// import {Link} from 'react-router-dom'

function FormStep1(props) {
    const validateCelular = (value) => {
        const celularRegex = /^3\d{9}$/;
        return celularRegex.test(value);
    };

    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        
        if (name === 'celular') {
            // Only allow numbers
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length <= 10) {
                props.handleChange({
                    target: { name, value: numericValue }
                });
            }
        } else {
            props.handleChange(event);
        }
    };

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
                            className={`form-control ${props.celular && !validateCelular(props.celular) ? 'is-invalid' : ''}`}
                            id="celular"
                            name="celular"
                            type="text"
                            placeholder="Ej: 3001234567"
                            value={props.celular}
                            onChange={handleInputChange}
                            />
                            {props.celular && !validateCelular(props.celular) && (
                                <div className="invalid-feedback">
                                    Por favor ingrese un número de celular válido
                                </div>
                            )}
                        </div>
                    </Col>
                    <Col md={6} sm={12} className="form-box-spacer">
                        <div className="form-group">
                            <label className="left-label-position" htmlFor="email">Email</label>
                            <input
                            className={`form-control ${props.email && !validateEmail(props.email) ? 'is-invalid' : ''}`}
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Escribe tu email"
                            value={props.email}
                            onChange={handleInputChange}
                            />
                            {props.email && !validateEmail(props.email) && (
                                <div className="invalid-feedback">
                                    Por favor ingrese un email válido
                                </div>
                            )}
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