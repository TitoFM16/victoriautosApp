import React from 'react';

const LoadingModal = ({ show, status, onClose }) => {
    if (!show) return null;

    return (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-body text-center p-4">
                        {status === 'loading' && (
                            <>
                                <div className="spinner-border text-primary mb-3" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mb-0">Enviando información, un momento por favor...</p>
                            </>
                        )}
                        {status === 'success' && (
                            <>
                                <div className="text-success mb-3">
                                    <i className="fa fa-check-circle fa-3x"></i>
                                </div>
                                <p className="mb-3">¡Información enviada exitosamente!</p>
                                <button className="btn btn-primary" onClick={onClose}>
                                    Aceptar
                                </button>
                            </>
                        )}
                        {status === 'error' && (
                            <>
                                <div className="text-danger mb-3">
                                    <i className="fa fa-times-circle fa-3x"></i>
                                </div>
                                <p className="mb-3">Hubo un error al enviar la información. Por favor intente nuevamente.</p>
                                <button className="btn btn-primary" onClick={onClose}>
                                    Cerrar
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingModal; 