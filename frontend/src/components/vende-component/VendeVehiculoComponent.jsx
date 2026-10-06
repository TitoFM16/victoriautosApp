import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {Link} from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import LoadingModal from '../shared/LoadingModal';
import PropTypes from 'prop-types';
import { event_gtag } from '../../utils/analytics';
import { WHATSAPP_DISPLAY, whatsappUrl } from '../../services/whatsapp';

import FormStep0 from './formStepZero';
import FormStep1 from './formStepOne';
import FormStep2 from './formStepTwo';
import FormStep3 from './formStepThree';
import { PRIVACY_CONSENT_MESSAGE } from '../shared/PrivacyConsent';



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
        privacy: false,
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
            privacy_accepted: formData.privacy,
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
        if (currentStep === 1 && !formData.privacy) {
            alert(PRIVACY_CONSENT_MESSAGE);
            return;
        }
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

    const isSubmitting = showLoadingModal && submitStatus === 'loading';

    const previousButton = () => {
        if (currentStep > 1) {
            return (
                <button
                    className="vf-btn vf-btn--secondary"
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
                    className="vf-btn vf-btn--primary"
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
                    className="vf-btn vf-btn--primary"
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                >
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                </button>
            );
        }
        return null;
    }
    const empecemosButton = () => {
        if (currentStep === 0) {
            return (
                <div className="vf-actions">
                    <button
                        className="vf-btn vf-btn--primary vf-btn--block"
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
            <div className="vf-page">
                <nav aria-label="breadcrumb" className="vf-crumbs">
                    <Link to="/">Inicio</Link>
                    <span aria-hidden="true">/</span>
                    <span>Vende Tu Vehículo</span>
                </nav>
                <h1 className="vf-title">Compramos tu usado</h1>
                <p className="vf-sub">Cuéntanos de tu carro y te hacemos una oferta.</p>
                <div className="vf-card">
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
                            privacy={formData.privacy}
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
                        <div className="vf-footer">
                            {previousButton() || <span className="vf-footer-spacer" aria-hidden="true" />}
                            {nextButton()}
                        </div>
                    )}
                    {currentStep >= 1 && (
                        <p className="vf-reassure">
                            <span className="material-symbols-outlined" aria-hidden="true">lock</span>
                            Tus datos solo se usan para contactarte.
                        </p>
                    )}
                    {empecemosButton()}
                    <p className="vf-wa-line">
                        ¿Prefieres escribirnos?
                        <a href={whatsappUrl('Hola Victoriautos, quiero vender mi vehículo.')} target="_blank" rel="noopener noreferrer">
                            WhatsApp {WHATSAPP_DISPLAY}
                        </a>
                    </p>
                </div>
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
            <h2 className="vf-intro-head">¿Tienes un vehículo para la venta?</h2>
            <p className="vf-intro-sub">¡En 3 simples pasos te lo compramos!</p>
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
            <CircleSteps currentStep={props.currentStep} />
            <h2 className="vf-section-title">Datos de Contacto</h2>
            <p className="vf-section-hint">Para poder comunicarnos contigo.</p>
            <FormStep1  nombre={props.nombre}
                        apellido={props.apellido}
                        celular={props.celular}
                        email={props.email}
                        wppcheck={props.wppcheck}
                        privacy={props.privacy}
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
  wppcheck: PropTypes.bool.isRequired,
  privacy: PropTypes.bool.isRequired
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
            <CircleSteps currentStep={props.currentStep} />
            <h2 className="vf-section-title">Datos del Vehículo</h2>
            <p className="vf-section-hint">Cuéntanos cómo es tu carro.</p>
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
            <CircleSteps currentStep={props.currentStep} />
            <h2 className="vf-section-title">Fotografías del Vehículo</h2>
            <p className="vf-section-hint">Sube las 6 fotos para que podamos valorar tu carro.</p>
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
        { number: 1, label: 'Tus datos' },
        { number: 2, label: 'Tu vehículo' },
        { number: 3, label: 'Fotos' },
    ];
    const current = steps.find((step) => step.number === props.currentStep);
    const percent = Math.round((props.currentStep / steps.length) * 100);
    return(
        <div className="vf-stepper">
            <p className="vf-stepper-compact">Paso {props.currentStep} de {steps.length} · {current?.label}</p>
            <ol className="vf-stepper-list">
                {steps.map((step) => {
                    const state = props.currentStep === step.number ? 'is-current' : props.currentStep > step.number ? 'is-done' : '';
                    return (
                        <li key={step.number} className={`vf-stepper-item ${state}`} aria-current={state === 'is-current' ? 'step' : undefined}>
                            <span className="vf-stepper-dot" aria-hidden="true">
                                {state === 'is-done'
                                    ? <span className="material-symbols-outlined">check</span>
                                    : step.number}
                            </span>
                            {step.label}
                        </li>
                    );
                })}
            </ol>
            <div className="vf-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Progreso">
                <div className="vf-progress-bar" style={{ width: `${percent}%` }} />
            </div>
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
        <div className="vf-captcha">
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
