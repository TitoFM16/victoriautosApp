import {  Suspense, lazy } from "react";
import Buscador from './Busca_Vende_VehiculoComponent';

import CarCarousel from "./CarCarouselComponent";

const InvitaVenta = lazy(() => import('./InvitaVentaComponent'));
const LoadingComponent = lazy(() => import('../shared/loadingComponent'));

const TRUST_ITEMS = [
    ['verified', 'Vehículos revisados', 'Selección con inspección y respaldo.'],
    ['handshake', 'Negociación clara', 'Información directa para decidir tranquilo.'],
    ['location_on', 'Atención local', 'Visítanos en la Avenida Panamericana.'],
    ['payments', 'Financiación', 'Opciones para facilitar tu compra.'],
];

function Home() {
    return(
        <div className="homepage-shell bg-victoria-cream">
            <Buscador />
            <section className="home-trust" aria-label="Razones para elegir Victoriautos">
                <ul className="home-trust__bar">
                    {TRUST_ITEMS.map(([icon, title, description]) => (
                        <li className="home-trust__item" key={title}>
                            <span className="home-trust__icon material-symbols-outlined" aria-hidden="true">{icon}</span>
                            <div>
                                <p className="home-trust__title">{title}</p>
                                <p className="home-trust__text">{description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
            <CarCarousel />
            <Suspense fallback={<LoadingComponent/>}>
                <InvitaVenta />
            </Suspense>
        </div>
    );
}

export default Home;
