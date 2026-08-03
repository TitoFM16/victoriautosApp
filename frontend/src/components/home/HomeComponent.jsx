import {  Suspense, lazy } from "react";
import Buscador from './Busca_Vende_VehiculoComponent';

import CarCarousel from "./CarCarouselComponent";

const InvitaVenta = lazy(() => import('./InvitaVentaComponent'));
const LoadingComponent = lazy(() => import('../shared/loadingComponent'));
function Home() {
    return(
        <div className="homepage-shell overflow-x-hidden bg-victoria-cream">
            <Buscador />
            <section className="border-b border-zinc-200 bg-white" aria-label="Razones para elegir Victoriautos">
                <div className="mx-auto grid max-w-[1400px] divide-y divide-zinc-200 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
                    <div className="py-8 sm:px-7 sm:py-10 sm:first:pl-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-victoria-red">01 · Selección</p>
                        <p className="mt-2 text-lg font-black text-victoria-dark">Vehículos revisados y bien presentados.</p>
                    </div>
                    <div className="py-8 sm:px-7 sm:py-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-victoria-red">02 · Claridad</p>
                        <p className="mt-2 text-lg font-black text-victoria-dark">Información directa para decidir tranquilo.</p>
                    </div>
                    <div className="py-8 sm:px-7 sm:py-10 sm:last:pr-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-victoria-red">03 · Cercanía</p>
                        <p className="mt-2 text-lg font-black text-victoria-dark">Atención local en la Avenida Panamericana.</p>
                    </div>
                </div>
            </section>
            <CarCarousel />
            <Suspense fallback={<LoadingComponent/>}>
                <InvitaVenta />
            </Suspense>
        </div>
    );
}

export default Home;
