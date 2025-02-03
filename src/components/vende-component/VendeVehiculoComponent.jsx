import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {Breadcrumb, BreadcrumbItem} from 'reactstrap';
import {Link} from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import LoadingModal from '../shared/LoadingModal';
import PropTypes from 'prop-types';

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
        submitFormData.append('g-recaptcha-response', formData.captcha);
        
        // Add other form data
        const formValues = {
            DIR: DIR,
            nombre: formData.nombre,
            apellido: formData.apellido,        
            celular: formData.celular,
            email: formData.email,
            wppcheck: formData.wppcheck,
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
            submitFormData.append('images', image);
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
                <div className='vertical-center'>
                    <button 
                        className="btn cancel-button float-right mx-2 my-2" 
                        type="button" 
                        onClick={_prev}
                    >
                        Atras
                    </button>
                </div>
            );
        }
        return null;
    }
    
    const nextButton = () => {
        if (currentStep < 3 && currentStep >= 1) {
            return (
                <div className='vertical-center'>
                    <button 
                        className="btn submit-button float-left mx-2 my-2" 
                        type="button" 
                        onClick={_next}
                    >
                        Siguiente 
                    </button>        
                </div> 
            );
        }
        
        if (currentStep === 3) {
            return (
                <div className='vertical-center'>
                    <button
                        className="btn submit-button float-left mx-2 my-2"
                        type="submit"
                        onClick={handleSubmit}
                    >
                        Enviar
                    </button>
                </div>
            );
        }
        return null;
    }
    const empecemosButton = () => {
        if (currentStep === 0) {
            return (
                <div className='vertical-center my-4 py-2'>
                    <button 
                        className="btn submit-button" 
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
        return nombre && apellido && celular && email;
    }

    const validateStep2 = () => {
        const { marca, linea, modelo, km, matricula, price } = formData;
        return marca && linea && modelo && km && matricula && price;
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
            <div className="container d-flex flex-column py-2">
                <Breadcrumb>
                    <BreadcrumbItem><Link to="/home">Inicio</Link></BreadcrumbItem>
                    <BreadcrumbItem active>Vende Tu Vehículo</BreadcrumbItem>
                </Breadcrumb> 
                <div className="col-12">
                    <h3>Compramos tu usado</h3>
                    <hr />
                </div>   
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
                <div className='prev-next-btn'>
                    {previousButton()}
                    {nextButton()}
                </div>
                {empecemosButton()}
            </div>
            <LoadingModal 
                show={showLoadingModal}
                status={submitStatus}
                onClose={() => {
                    setShowLoadingModal(false);
                    if (submitStatus === 'success') {
                        // Optionally redirect or reset form
                        window.location.href = '/home';
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
        <div className="vertical-center">
            <div className="container">
                <h1 className='pb-4 px-2 fw-bold'>¿Tienes un vehiculo para la venta?</h1>
                <h3 className='px-0 fw-light mb-4 pb-2'>¡En 3 simples pasos te lo compramos !</h3>
                <FormStep0/>
            </div>
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
        <div className="form-group">
            <div className="vertical-center">
                <div className="container">
                    <h1 className='pb-4 px-2'>Datos de Contacto</h1>
                    <CircleSteps currentStep={props.currentStep} />
                    <FormStep1  nombre={props.nombre}
                                apellido={props.apellido}  
                                celular={props.celular}
                                email={props.email}
                                wppcheck={props.wppcheck}
                                handleChange = {props.handleChange}
                    />
                </div>
            </div>
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
        <div className="form-group">
            <div className="vertical-center">
                <div className="container">
                    <h1 className='pb-4 px-2'>Datos del Vehículo</h1>
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
            </div>
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
        <div className="form-group">
            <div className="vertical-center">
                <div className="container">
                    <h1 className='pb-4 px-2'>Fotografias del Vehículo</h1>
                    <CircleSteps currentStep={props.currentStep} />
                    <FormStep3  frenteImg={props.frenteImg}
                                traseroImg={props.traseroImg}
                                lateralIzqImg={props.lateralIzqImg}
                                lateralDerImg={props.lateralDerImg}
                                interiorImg={props.interiorImg}
                                motorImg={props.motorImg}
                                handleChange = {props.handleChange}
                    />
                </div>
            </div>
        </div>
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
    return(
        <div>
            <div className="steps-container d-flex justify-content-center">
                <div className={props.currentStep === 1? "step active": "step"}>
                    <div className={props.currentStep === 1? "step-circle active": "step-circle"}>
                        <p className='my-auto'>1</p>
                    </div>
                    <p className="d-none d-md-inline">Datos de contacto</p>
                </div>
                <div className={props.currentStep === 2? "step active": "step"}>
                    <div className={props.currentStep === 2? "step-circle active": "step-circle"}>
                        <p className='my-auto'>2</p>
                    </div>
                    <p className="d-none d-md-inline">Datos del Vehículo</p>
                </div>
                <div className={props.currentStep === 3? "step active": "step"}>
                    <div className={props.currentStep === 3? "step-circle active": "step-circle"}>
                        <p className='my-auto'>3</p>
                    </div>
                    <p className="d-none d-md-inline">Fotos del Vehículo</p>
                </div>
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
        <div id="recaptcha">
            <div className='row vertical-center '>
                <div className="Captcha">
                    <ReCAPTCHA
                        sitekey={"6Ld0PcgqAAAAAFbIAfRwUtK5CNjuJli7-iyxtbeJ"}
                        onChange={onChange}
                    />
                </div>
            </div>
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