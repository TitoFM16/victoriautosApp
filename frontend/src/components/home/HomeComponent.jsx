import {  Suspense, lazy } from "react";
import Buscador from './Busca_Vende_VehiculoComponent';

import CarCarousel from "./CarCarouselComponent";

const InvitaVenta = lazy(() => import('./InvitaVentaComponent'));
const LoadingComponent = lazy(() => import('../shared/loadingComponent'));
function Home() {
    return(
        <div className="homepage-shell bg-victoria-cream">
            <Buscador />
            <section className="feature-section" aria-label="Razones para elegir Victoriautos">
                <div className="feature-grid">
                    {[
                        ['01', 'Selección', 'Vehículos revisados y bien presentados.'],
                        ['02', 'Claridad', 'Información directa para decidir tranquilo.'],
                        ['03', 'Cercanía', 'Atención local en la Avenida Panamericana.'],
                    ].map(([number, title, description]) => (
                        <div className="feature-card" key={number}>
                            <p><span className="feature-number">{number}</span> {title}</p>
                            <p>{description}</p>
                        </div>
                    ))}
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
