import React, { useEffect, useState, Suspense } from "react";
import Buscador from './Busca_Vende_VehiculoComponent';

import CarCarousel from "./CarCarouselComponent";

const InvitaVenta = React.lazy(() => import('./InvitaVentaComponent'));
const LoadingComponent = React.lazy(() => import('../shared/loadingComponent'));
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