import PropTypes from 'prop-types';

const inputClass = (invalid) => `vf-input${invalid ? ' is-invalid' : ''}`;

const FieldError = ({ children }) => (
    <p className="vf-error" role="alert">
        <span className="material-symbols-outlined" aria-hidden="true">error</span>
        {children}
    </p>
);
FieldError.propTypes = { children: PropTypes.node };

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
        <div className="vf-fields">
            <div className="vf-grid">
                <div>
                    <label className="vf-label" htmlFor="nombre">Nombre</label>
                    <input
                        className="vf-input"
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Escribe tu nombre"
                        value={props.nombre}
                        onChange={props.handleChange}
                    />
                </div>
                <div>
                    <label className="vf-label" htmlFor="apellido">Apellido</label>
                    <input
                        className="vf-input"
                        id="apellido"
                        name="apellido"
                        type="text"
                        placeholder="Escribe tu apellido"
                        value={props.apellido}
                        onChange={props.handleChange}
                    />
                </div>
                <div>
                    <label className="vf-label" htmlFor="celular">Celular</label>
                    <input
                        className={inputClass(props.celular && !validateCelular(props.celular))}
                        inputMode="numeric"
                        id="celular"
                        name="celular"
                        type="text"
                        placeholder="Ej: 3001234567"
                        value={props.celular}
                        onChange={handleInputChange}
                    />
                    {props.celular && !validateCelular(props.celular) && (
                        <FieldError>Por favor ingrese un número de celular válido</FieldError>
                    )}
                </div>
                <div>
                    <label className="vf-label" htmlFor="email">Email</label>
                    <input
                        className={inputClass(props.email && !validateEmail(props.email))}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Escribe tu email"
                        value={props.email}
                        onChange={handleInputChange}
                    />
                    {props.email && !validateEmail(props.email) && (
                        <FieldError>Por favor ingrese un email válido</FieldError>
                    )}
                </div>
            </div>

            <label className="vf-check" htmlFor="wppCheckbox">
                <input
                                        id="wppCheckbox"
                    name="wppcheck"
                    type="checkbox"
                    defaultChecked={props.wppcheck}
                    onChange={props.handleChange}
                />
                <span>¿Aceptas comunicación vía Whatsapp?</span>
            </label>
        </div>
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
