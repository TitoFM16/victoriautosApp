import React, { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import LoadingComponent from '../components/shared/loadingComponent';

const Home = React.lazy(() => import('../components/home-components/HomeComponent'));
const Vitrina = React.lazy(() => import('../components/vitrina-components/VitrinaComponent'));
const CarDetailComponent = React.lazy(() => import('../components/vitrina-components/CardetailComponent'));
const VendeForm = React.lazy(() => import('../components/vende-component/VendeVehiculoComponent'));
const InteresFormComponent = React.lazy(() => import('../components/InteresFormComponent'));

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.05
};

const ClientRoutes = ({ cars }) => {
  return (
    <Suspense fallback={<LoadingComponent />}>

        <Routes>        
          <Route path="/" element={<Home />} />
          <Route path="/vitrina" element={<Vitrina cars={cars} />} />
          <Route path="/vitrina/:carId" element={<CarDetailComponent mode="client" />} />
          <Route path="/vende" element={<VendeForm />} />
          <Route path="/interes" element={<InteresFormComponent />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

    </Suspense>
  );
};

export default ClientRoutes; 