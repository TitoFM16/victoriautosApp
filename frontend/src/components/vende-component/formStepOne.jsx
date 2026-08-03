import PropTypes from 'prop-types';

const controlClass = 'mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-victoria-dark outline-none transition focus:border-victoria-red focus:ring-2 focus:ring-red-100';
const invalidControlClass = 'mt-2 h-12 w-full rounded-xl border border-victoria-red bg-white px-3 text-sm text-victoria-dark outline-none transition focus:border-victoria-red focus:ring-2 focus:ring-red-100';
const labelClass = 'text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500';

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
        <div className="mt-8 border border-zinc-200 bg-white p-6 sm:p-10">
            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <label className={labelClass} htmlFor="nombre">Nombre</label>
                    <input
                        className={controlClass}
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Escribe tu nombre"
                        value={props.nombre}
                        onChange={props.handleChange}
                    />
                </div>
                <div>
                    <label className={labelClass} htmlFor="apellido">Apellido</label>
                    <input
                        className={controlClass}
                        id="apellido"
                        name="apellido"
                        type="text"
                        placeholder="Escribe tu apellido"
                        value={props.apellido}
                        onChange={props.handleChange}
                    />
                </div>
                <div>
                    <label className={labelClass} htmlFor="celular">Celular</label>
                    <input
                        className={props.celular && !validateCelular(props.celular) ? invalidControlClass : controlClass}
                        id="celular"
                        name="celular"
                        type="text"
                        placeholder="Ej: 3001234567"
                        value={props.celular}
                        onChange={handleInputChange}
                    />
                    {props.celular && !validateCelular(props.celular) && (
                        <p className="mt-2 text-xs font-bold text-victoria-red">
                            Por favor ingrese un número de celular válido
                        </p>
                    )}
                </div>
                <div>
                    <label className={labelClass} htmlFor="email">Email</label>
                    <input
                        className={props.email && !validateEmail(props.email) ? invalidControlClass : controlClass}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Escribe tu email"
                        value={props.email}
                        onChange={handleInputChange}
                    />
                    {props.email && !validateEmail(props.email) && (
                        <p className="mt-2 text-xs font-bold text-victoria-red">
                            Por favor ingrese un email válido
                        </p>
                    )}
                </div>
            </div>

            <label className="mt-6 flex items-center gap-3 text-sm font-bold text-zinc-700" htmlFor="wppCheckbox">
                <input
                    className="h-5 w-5 accent-victoria-red"
                    id="wppCheckbox"
                    name="wppcheck"
                    type="checkbox"
                    defaultChecked={props.wppcheck}
                    onChange={props.handleChange}
                />
                ¿Aceptas comunicación vía Whatsapp?
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
