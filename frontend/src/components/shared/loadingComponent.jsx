function LoadingComponent() {
    return (
        <div className="grid min-h-56 place-items-center bg-white" role="status" aria-live="polite">
            <div className="text-center">
                <span className="mx-auto block h-8 w-8 animate-spin border-2 border-zinc-200 border-t-victoria-red" aria-hidden="true" />
                <span className="mt-4 block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Cargando Victoriautos</span>
            </div>
        </div>
    );
}

export default LoadingComponent;
