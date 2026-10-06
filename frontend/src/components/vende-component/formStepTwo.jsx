import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import axios from 'axios';

const inputClass = (invalid) => `vf-input${invalid ? ' is-invalid' : ''}`;

const FieldError = ({ children }) => (
    <p className="vf-error" role="alert">
        <span className="material-symbols-outlined" aria-hidden="true">error</span>
        {children}
    </p>
);
FieldError.propTypes = { children: PropTypes.node };

const inventoryMarcasFrom = (cars) => [...new Set(cars.map((car) => car.marca).filter(Boolean))]
    .map((brand) => ({ marca: brand }));

const inventoryLineasFrom = (cars, brand) => [...new Set(cars
    .filter((car) => car.marca === brand)
    .map((car) => car.linea)
    .filter(Boolean))].map((line) => ({ linea: line, version: '' }));

function FormStep2(props) {

    const inventoryCars = useSelector((state) => state.cars.cars);
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
                const catalogOptions = Array.isArray(response.data) ? response.data : [];
                setMarcaDropdown(catalogOptions.length > 0 ? catalogOptions : inventoryMarcasFrom(inventoryCars));
            })
            .catch(() => {
                setMarcaDropdown(inventoryMarcasFrom(inventoryCars));
            });
    }, [inventoryCars]);

    // Effect to fetch lineas when marca is pre-filled
    useEffect(() => {
        if (props.marca) {
            axios
                .get('/api/buscavehiculo/?tipo=' + tipo + '&marca=' + props.marca)
                .then((response) => {
                    const catalogOptions = Array.isArray(response.data) ? response.data : [];
                    setLineaDropdown(catalogOptions.length > 0 ? catalogOptions : inventoryLineasFrom(inventoryCars, props.marca));
                })
                .catch(() => {
                    setLineaDropdown(inventoryLineasFrom(inventoryCars, props.marca));
                });
        }
    }, [inventoryCars, props.marca]);


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
            const catalogOptions = Array.isArray(response.data) ? response.data : [];
            setLineaDropdown(catalogOptions.length > 0 ? catalogOptions : inventoryLineasFrom(inventoryCars, value));
        })
            .catch(() => {
          setLineaDropdown(inventoryLineasFrom(inventoryCars, value));
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
        <div className="vf-fields">
            <div className="vf-grid">
                <div>
                    <label className="vf-label" htmlFor="marca">Marca del vehículo</label>
                    <select
                        className="vf-input"
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
                                    <option key={marca.id || marca.marca} value={marca.marca}>{marca.marca}</option>
                                );
                            }) : null}
                    </select>
                </div>
                <div>
                    <label className="vf-label" htmlFor="linea">Línea del vehículo</label>
                    <select
                        className="vf-input"
                        id="linea"
                        name="linea"
                        value={props.linea}
                        onChange={handleLineaChange}
                    >
                        <option value=''>Línea</option>
                        {marca !== '' ? lineaDropdown
                            .sort((a, b) => (a.linea + ' ' + (a.version || '')).localeCompare(b.linea + ' ' + (b.version || '')))
                            .map((linea) => {
                                const text = `${linea.linea} ${linea.version || ''}`.trim();
                                return (
                                    <option key={linea.id || text} value={text}>
                                        {text}
                                    </option>
                                );
                            }) : null}
                    </select>
                </div>
                <div>
                    <label className="vf-label" htmlFor="modelo">Modelo (Año)</label>
                    <input
                        className={inputClass(props.modelo && !validateModelo(props.modelo))}
                        inputMode="numeric"
                        id="modelo"
                        name="modelo"
                        type="text"
                        placeholder="Ej: 2020"
                        value={props.modelo}
                        onChange={handleInputChange}
                    />
                    {props.modelo && !validateModelo(props.modelo) && (
                        <FieldError>El año debe ser válido</FieldError>
                    )}
                </div>
                <div>
                    <label className="vf-label" htmlFor="km">Kilometraje</label>
                    <input
                        className={inputClass(props.km && !validateKilometraje(props.km))}
                        inputMode="numeric"
                        id="km"
                        name="km"
                        type="text"
                        placeholder="Ej: 50000"
                        value={props.km}
                        onChange={handleInputChange}
                    />
                    {props.km && !validateKilometraje(props.km) && (
                        <FieldError>El kilometraje debe ser menor a 10.000.000</FieldError>
                    )}
                </div>
                <div>
                    <label className="vf-label" htmlFor="matricula">Ciudad de matrícula</label>
                    <input
                        className="vf-input"
                        id="matricula"
                        name="matricula"
                        type="text"
                        placeholder="Escribe tu ciudad de matrícula"
                        value={props.matricula}
                        onChange={props.handleChange}
                    />
                </div>
                <div>
                    <label className="vf-label" htmlFor="price">Precio del vehículo</label>
                    <input
                        className={inputClass(props.price && !validatePrecio(props.price))}
                        inputMode="numeric"
                        id="price"
                        name="price"
                        type="text"
                        placeholder="Ej: $ 50.000.000"
                        value={formatPrice(props.price)}
                        onChange={handleInputChange}
                    />
                    {props.price && !validatePrecio(props.price) && (
                        <FieldError>Por favor ingresa un precio razonable :)</FieldError>
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
