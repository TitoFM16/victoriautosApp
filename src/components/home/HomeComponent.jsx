import {  Suspense, lazy } from "react";
import Buscador from './Busca_Vende_VehiculoComponent';

import CarCarousel from "./CarCarouselComponent";

const InvitaVenta = lazy(() => import('./InvitaVentaComponent'));
const LoadingComponent = lazy(() => import('../shared/loadingComponent'));
import Separator from "./SeparatorComponent";


function Home() {
    return(
        <div style={{ overflowX: 'hidden' }}>
            <Buscador />
            <CarCarousel />
            <Separator />
            <Suspense fallback={<LoadingComponent/>}>
                <InvitaVenta />
            </Suspense>
        </div>
    );
}

export default Home;