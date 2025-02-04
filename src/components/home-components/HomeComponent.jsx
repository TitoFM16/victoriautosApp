import React, { useEffect, useState, Suspense } from "react";
import Buscador from './Busca_Vende_VehiculoComponent';
import BuscadorMobile from './Busca_Vende_VehiculoMobileComponent';
import CarCarousel from "./CarCarouselComponent";

const InvitaVenta = React.lazy(() => import('./InvitaVentaComponent'));
const LoadingComponent = React.lazy(() => import('../shared/loadingComponent'));
import Separator from "./SeparatorComponent";

function BuscadorWrapper() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile ? <BuscadorMobile /> : <Buscador />;
}

function Home() {
    return(
        <div style={{ overflowX: 'hidden' }}>
            <BuscadorWrapper />
            <CarCarousel />
            <Separator />
            <Suspense fallback={<LoadingComponent/>}>
                <InvitaVenta />
            </Suspense>
        </div>
    );
}

export default Home;