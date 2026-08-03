import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

import axios from 'axios';

const controlClass = 'mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-victoria-dark outline-none transition focus:border-victoria-red focus:ring-2 focus:ring-red-100';
const invalidControlClass = 'mt-2 h-12 w-full rounded-xl border border-victoria-red bg-white px-3 text-sm text-victoria-dark outline-none transition focus:border-victoria-red focus:ring-2 focus:ring-red-100';
const labelClass = 'text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500';

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
        <div className="mt-8 border border-zinc-200 bg-white p-6 sm:p-10">
            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <label className={labelClass} htmlFor="marca">Marca del vehículo</label>
                    <select
                        className={controlClass}
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
                <div>
                    <label className={labelClass} htmlFor="linea">Línea del vehículo</label>
                    <select
                        className={controlClass}
                        id="linea"
                        name="linea"
                        value={props.linea}
                        onChange={handleLineaChange}
                    >
                        <option value=''>Línea</option>
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
                <div>
                    <label className={labelClass} htmlFor="modelo">Modelo (Año)</label>
                    <input
                        className={props.modelo && !validateModelo(props.modelo) ? invalidControlClass : controlClass}
                        id="modelo"
                        name="modelo"
                        type="text"
                        placeholder="Ej: 2020"
                        value={props.modelo}
                        onChange={handleInputChange}
                    />
                    {props.modelo && !validateModelo(props.modelo) && (
                        <p className="mt-2 text-xs font-bold text-victoria-red">
                            El año debe ser válido
                        </p>
                    )}
                </div>
                <div>
                    <label className={labelClass} htmlFor="km">Kilometraje</label>
                    <input
                        className={props.km && !validateKilometraje(props.km) ? invalidControlClass : controlClass}
                        id="km"
                        name="km"
                        type="text"
                        placeholder="Ej: 50000"
                        value={props.km}
                        onChange={handleInputChange}
                    />
                    {props.km && !validateKilometraje(props.km) && (
                        <p className="mt-2 text-xs font-bold text-victoria-red">
                            El kilometraje debe ser menor a 10.000.000
                        </p>
                    )}
                </div>
                <div>
                    <label className={labelClass} htmlFor="matricula">Ciudad de matrícula</label>
                    <input
                        className={controlClass}
                        id="matricula"
                        name="matricula"
                        type="text"
                        placeholder="Escribe tu ciudad de matrícula"
                        value={props.matricula}
                        onChange={props.handleChange}
                    />
                </div>
                <div>
                    <label className={labelClass} htmlFor="price">Precio del vehículo</label>
                    <input
                        className={props.price && !validatePrecio(props.price) ? invalidControlClass : controlClass}
                        id="price"
                        name="price"
                        type="text"
                        placeholder="Ej: $ 50.000.000"
                        value={formatPrice(props.price)}
                        onChange={handleInputChange}
                    />
                    {props.price && !validatePrecio(props.price) && (
                        <p className="mt-2 text-xs font-bold text-victoria-red">
                            Por favor ingresa un precio razonable :)
                        </p>
                    )}
                </div>
            </div>
        </div>
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
