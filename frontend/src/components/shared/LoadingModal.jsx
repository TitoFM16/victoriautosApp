import PropTypes from 'prop-types';

const LoadingModal = ({ show, status, onClose }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 px-5" role="dialog" aria-modal="true">
            <div className="w-full max-w-sm border-t-4 border-victoria-red bg-white p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,.35)]">
                {status === 'loading' && (
                    <>
                        <span className="mx-auto block h-10 w-10 animate-spin border-2 border-zinc-200 border-t-victoria-red" aria-hidden="true" />
                        <p className="mt-5 text-sm font-bold text-victoria-dark">Enviando información, un momento por favor...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-victoria-red text-2xl font-black text-white" aria-hidden="true">✓</div>
                        <p className="mt-5 text-sm font-bold text-victoria-dark">¡Información enviada exitosamente!</p>
                        <button
                            type="button"
                            className="mt-6 w-full rounded-xl bg-victoria-red px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-800"
                            onClick={onClose}
                        >
                            Aceptar
                        </button>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-zinc-800 text-2xl font-black text-white" aria-hidden="true">✕</div>
                        <p className="mt-5 text-sm font-bold text-victoria-dark">Hubo un error al enviar la información. Por favor intente nuevamente.</p>
                        <button
                            type="button"
                            className="mt-6 w-full rounded-xl bg-victoria-dark px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-black"
                            onClick={onClose}
                        >
                            Cerrar
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

LoadingModal.propTypes = {
    show: PropTypes.bool.isRequired,
    status: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};

export default LoadingModal;
