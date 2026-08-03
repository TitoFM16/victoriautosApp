import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {Link} from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import LoadingModal from '../shared/LoadingModal';
import PropTypes from 'prop-types';
import { event_gtag } from '../../utils/analytics';

import FormStep0 from './formStepZero';
import FormStep1 from './formStepOne';
import FormStep2 from './formStepTwo';
import FormStep3 from './formStepThree';



function VendeForm() {
    const location = useLocation();
    const { state } = location;

    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        celular: '',
        email: '',
        wppcheck: false,
        marca: state?.marca || '',
        linea: state?.linea || '',
        modelo: state?.modelo || '',
        km: state?.km || '',
        matricula: '',
        price: '',
        captcha: '',
        frenteImg: '',
        traseroImg: '',
        lateralIzqImg: '',
        lateralDerImg: '',
        interiorImg: '',
        motorImg: '',

    });

    const [showLoadingModal, setShowLoadingModal] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('loading');

    const handleChange = (event) => {
        const { name, type, value } = event.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: event.target.checked
            }));
        } else if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: event.target.files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = event => {
        event_gtag({
            action: "click",
            category: "button",
            label: "Enviar oferta",
            value: 1,
          });
        event.preventDefault();

        if (!validateStep3()) {
            alert('Por favor suba todas las fotos requeridas');
            return;
        }

        if (!formData.captcha) {
            alert('Por favor complete el captcha');
            return;
        }

        const DIR = formData.marca + "_" + formData.linea + "_" + formData.modelo + "/";

        const submitFormData = new FormData();

        // Add the reCAPTCHA response token with the exact key expected by the server
        submitFormData.append('recaptcha_token', formData.captcha);

        // Add other form data
        const formValues = {
            DIR: DIR,
            nombre: formData.nombre,
            apellido: formData.apellido,
            celular: formData.celular,
            email: formData.email,
            wpp_check: formData.wppcheck,
            marca: formData.marca,
            linea: formData.linea,
            modelo: formData.modelo,
            km: formData.km,
            matricula: formData.matricula,
            price: formData.price
        };

        Object.entries(formValues).forEach(([key, value]) => {
            submitFormData.append(key, value);
        });

        // Add images
        const images = [
            formData.frenteImg,
            formData.traseroImg,
            formData.lateralIzqImg,
            formData.lateralDerImg,
            formData.interiorImg,
            formData.motorImg
        ];

        images.forEach(image => {
            submitFormData.append('car_images', image);
        });

        setShowLoadingModal(true);
        setSubmitStatus('loading');

        axios.post('/api/ofertas', submitFormData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            }
        })
        .then(res => {
            setSubmitStatus('success');
            console.log(res);
        })
        .catch(error => {
            setSubmitStatus('error');
            if (error.response?.data?.error) {
                alert(error.response.data.error);
            } else {
                alert('Error al enviar el formulario. Por favor intente nuevamente.');
            }
            console.error('Error:', error.response || error);
        });
    };

    const _next = () => {
        if (currentStep === 1 && !validateStep1()) {
            alert('Por favor complete todos los campos antes de continuar');
            return;
        }
        if (currentStep === 2 && !validateStep2()) {
            alert('Por favor complete todos los campos antes de continuar');
            return;
        }

        setCurrentStep(prev => prev >= 2 ? 3 : prev + 1);
    }

    const _prev = () => {
        setCurrentStep(prev => prev <= 0 ? 0 : prev - 1);
    }

    const previousButton = () => {
        if (currentStep > 1) {
            return (
                <button
                    className="border border-zinc-300 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-victoria-dark transition hover:border-victoria-dark"
                    type="button"
                    onClick={_prev}
                >
                    Atrás
                </button>
            );
        }
        return null;
    }

    const nextButton = () => {
        if (currentStep < 3 && currentStep >= 1) {
            return (
                <button
                    className="rounded-xl bg-victoria-red px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-800"
                    type="button"
                    onClick={_next}
                >
                    Siguiente
                </button>
            );
        }

        if (currentStep === 3) {
            return (
                <button
                    className="rounded-xl bg-victoria-red px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-800"
                    type="submit"
                    onClick={handleSubmit}
                >
                    Enviar
                </button>
            );
        }
        return null;
    }
    const empecemosButton = () => {
        if (currentStep === 0) {
            return (
                <div className="mt-9">
                    <button
                        className="rounded-xl bg-victoria-red px-7 py-4 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-red-800"
                        type="button"
                        onClick={_next}
                    >
                        Vamos!
                    </button>
                </div>
            );
        }
        return null;
    }

    const validateStep1 = () => {
        const { nombre, apellido, celular, email } = formData;
        const celularRegex = /^3\d{9}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return nombre &&
               apellido &&
               celular &&
               celularRegex.test(celular) &&
               email &&
               emailRegex.test(email);
    }

    const validateStep2 = () => {
        const { marca, linea, modelo, km, matricula, price } = formData;

        const validateModelo = (value) => {
            const currentYear = new Date().getFullYear();
            const year = parseInt(value);
            return year >= 1920 && year <= currentYear + 1;
        };

        const validateKilometraje = (value) => {
            const kmValue = parseInt(value.replace(/\D/g, ''));
            return !isNaN(kmValue) && kmValue >= 0 && kmValue < 10000000;
        };

        const validatePrecio = (value) => {
            const precio = parseInt(value.replace(/\D/g, ''));
            return !isNaN(precio) && precio > 0 && precio < 100000000000;
        };

        return marca &&
               linea &&
               modelo && validateModelo(modelo) &&
               km && validateKilometraje(km) &&
               matricula &&
               price && validatePrecio(price);
    }

    const validateStep3 = () => {
        const { frenteImg, traseroImg, lateralIzqImg, lateralDerImg, interiorImg, motorImg } = formData;
        return frenteImg && traseroImg && lateralIzqImg && lateralDerImg && interiorImg && motorImg;
    }

    const handleCaptchaChange = (value) => {
        if (!value) {
            console.log('Captcha value is empty');
            return;
        }
        setFormData(prev => ({
            ...prev,
            captcha: value
        }));
    };

    return (
        <React.Fragment>
            <div className="mx-auto max-w-[900px] px-5 py-10 sm:px-8 sm:py-14">
                <nav aria-label="breadcrumb" className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                    <Link to="/" className="!no-underline text-victoria-red hover:text-red-800">Inicio</Link>
                    <span className="mx-2">/</span>
                    <span className="text-zinc-500">Vende Tu Vehículo</span>
                </nav>
                <h1 className="mt-4 border-b border-zinc-200 pb-7 !text-4xl font-black leading-none tracking-[-0.05em] text-victoria-dark sm:!text-5xl">Compramos tu usado</h1>
                <Step0
                    currentStep={currentStep}
                    handleChange={handleChange}
                />
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <Step1
                        currentStep={currentStep}
                        handleChange={handleChange}
                        nombre={formData.nombre}
                        apellido={formData.apellido}
                        celular={formData.celular}
                        email={formData.email}
                        wppcheck={formData.wppcheck}
                    />
                    <Step2
                        currentStep={currentStep}
                        handleChange={handleChange}
                        marca={formData.marca}
                        linea={formData.linea}
                        modelo={formData.modelo}
                        km={formData.km}
                        matricula={formData.matricula}
                        price={formData.price}
                    />
                    <Step3
                        currentStep={currentStep}
                        handleChange={handleChange}
                        frenteImg={formData.frenteImg}
                        traseroImg={formData.traseroImg}
                        lateralIzqImg={formData.lateralIzqImg}
                        lateralDerImg={formData.lateralDerImg}
                        interiorImg={formData.interiorImg}
                        motorImg={formData.motorImg}
                    />
                    <Captcha
                        onChange={handleCaptchaChange}
                        currentStep={currentStep}
                    />
                </form>
                {(previousButton() || nextButton()) && (
                    <div className="mt-6 flex justify-between gap-3">
                        {previousButton()}
                        {nextButton()}
                    </div>
                )}
                {empecemosButton()}
            </div>
            <LoadingModal
                show={showLoadingModal}
                status={submitStatus}
                onClose={() => {
                    setShowLoadingModal(false);
                    if (submitStatus === 'success') {
                        // Optionally redirect or reset form
                        window.location.href = '/';
                    }
                }}
            />
        </React.Fragment>
    );
}

//----------------------------------------------------------------------------------------------------------------------
//                                                    STEP 0
//----------------------------------------------------------------------------------------------------------------------
function Step0(props){
    if (props.currentStep !== 0) {
        return null
    }
    return(
        <div>
            <p className="mt-8 !text-2xl font-black tracking-[-0.03em] text-victoria-dark sm:!text-3xl">¿Tienes un vehículo para la venta?</p>
            <p className="mt-3 text-base text-zinc-600">¡En 3 simples pasos te lo compramos!</p>
            <FormStep0/>
        </div>
    )
}

Step0.propTypes = {
  currentStep: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired
};

//----------------------------------------------------------------------------------------------------------------------
//                                                    STEP 0<--
//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------
//                                                    STEP 1
//----------------------------------------------------------------------------------------------------------------------
function Step1(props) {
    if (props.currentStep !== 1) {
        return null
    }
    return(
        <div>
            <p className="mt-8 !text-2xl font-black tracking-[-0.03em] text-victoria-dark sm:!text-3xl">Datos de Contacto</p>
            <CircleSteps currentStep={props.currentStep} />
            <FormStep1  nombre={props.nombre}
                        apellido={props.apellido}
                        celular={props.celular}
                        email={props.email}
                        wppcheck={props.wppcheck}
                        handleChange = {props.handleChange}
            />
        </div>
    );
}

Step1.propTypes = {
  currentStep: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired,
  nombre: PropTypes.string.isRequired,
  apellido: PropTypes.string.isRequired,
  celular: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  wppcheck: PropTypes.bool.isRequired
};

//----------------------------------------------------------------------------------------------------------------------
//                                                    STEP 1<--
//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------
//                                                    STEP 2
//----------------------------------------------------------------------------------------------------------------------
function Step2(props) {
    if (props.currentStep !== 2) {
        return null
    }
    return(
        <div>
            <p className="mt-8 !text-2xl font-black tracking-[-0.03em] text-victoria-dark sm:!text-3xl">Datos del Vehículo</p>
            <CircleSteps currentStep={props.currentStep} />
            <FormStep2
                marca={props.marca}
                linea={props.linea}
                modelo={props.modelo}
                km={props.km}
                matricula={props.matricula}
                price={props.price}
                handleChange={props.handleChange}
            />
        </div>
    );
}

Step2.propTypes = {
  currentStep: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired,
  marca: PropTypes.string.isRequired,
  linea: PropTypes.string.isRequired,
  modelo: PropTypes.string.isRequired,
  km: PropTypes.string.isRequired,
  matricula: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired
};

//----------------------------------------------------------------------------------------------------------------------
//                                                    STEP 2<--
//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------
//                                                    STEP 3
//----------------------------------------------------------------------------------------------------------------------
function Step3(props) {
    if (props.currentStep !== 3) {
        return null
    }
    return(
        <React.Fragment>
            <p className="mt-8 !text-2xl font-black tracking-[-0.03em] text-victoria-dark sm:!text-3xl">Fotografías del Vehículo</p>
            <CircleSteps currentStep={props.currentStep} />
            <FormStep3  frenteImg={props.frenteImg}
                        traseroImg={props.traseroImg}
                        lateralIzqImg={props.lateralIzqImg}
                        lateralDerImg={props.lateralDerImg}
                        interiorImg={props.interiorImg}
                        motorImg={props.motorImg}
                        handleChange = {props.handleChange}
            />
        </React.Fragment>
    );
}

Step3.propTypes = {
  currentStep: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired,
  frenteImg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  traseroImg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  lateralIzqImg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  lateralDerImg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  interiorImg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  motorImg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired
};

//----------------------------------------------------------------------------------------------------------------------
//                                                    STEP 3<--
//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------
//                                                    CIRCLE STEPS
//----------------------------------------------------------------------------------------------------------------------
function CircleSteps(props){
    if (props.currentStep === 0) {
        return null
    }
    const steps = [
        { number: 1, label: 'Datos de contacto' },
        { number: 2, label: 'Datos del Vehículo' },
        { number: 3, label: 'Fotos del Vehículo' },
    ];
    return(
        <div className="mt-6 flex items-center justify-center gap-3 sm:gap-6">
            {steps.map((step) => {
                const active = props.currentStep === step.number;
                return (
                    <div key={step.number} className="flex items-center gap-2">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black ${active ? 'bg-victoria-red text-white' : 'border border-zinc-300 text-zinc-400'}`}>
                            {step.number}
                        </span>
                        <span className={`hidden text-xs font-bold sm:inline ${active ? 'text-victoria-dark' : 'text-zinc-400'}`}>{step.label}</span>
                    </div>
                );
            })}
        </div>
    )
}

CircleSteps.propTypes = {
  currentStep: PropTypes.number.isRequired
};

//----------------------------------------------------------------------------------------------------------------------
//                                                    CIRCLE STEP<--
//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------
//                                                    CAPTCHA
//----------------------------------------------------------------------------------------------------------------------

const Captcha = ({ onChange, currentStep }) => {
    if (currentStep !== 3) {
        return null;
    }

    return (
        <div className="mt-6 flex justify-center">
            <ReCAPTCHA
                sitekey={"6Ld0PcgqAAAAAFbIAfRwUtK5CNjuJli7-iyxtbeJ"}
                onChange={onChange}
            />
        </div>
    );
};

Captcha.propTypes = {
  onChange: PropTypes.func.isRequired,
  currentStep: PropTypes.number.isRequired
};

//----------------------------------------------------------------------------------------------------------------------
//                                                    CAPTCHA<--
//----------------------------------------------------------------------------------------------------------------------

export default VendeForm;
