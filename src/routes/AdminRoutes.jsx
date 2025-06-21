import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Protected from '../components/Protected';
import LoadingComponent from '../components/shared/loadingComponent';

const AdminComponent = React.lazy(() => import('../components/admin/AdminComponent'));
const HomeAdmin = React.lazy(() => import('../components/admin/Home/HomeAdminComponent'));
const NegociosComponent = React.lazy(() => import('../components/admin/Negocios/NegociosComponent'));
const BuscadoComponent = React.lazy(() => import('../components/admin/Buscado/buscado'));
const OfertasComponent = React.lazy(() => import('../components/admin/ofertas-components/OfertasComponent'));
const TramitesComponent = React.lazy(() => import('../components/admin/Tramites/TramitesComponent'));
const AdminVitrina = React.lazy(() => import('../components/admin/vitrina-vehiculos-component/VitrinaComponent'));
const DashboardComponent = React.lazy(() => import('../components/admin/Dashboard/DashboardComponent'));
const OfertaDetail = React.lazy(() => import('../components/admin/ofertas-components/OfertaDetailComponent'));
const CarDetailComponent = React.lazy(() => import('../components/vitrina-components/CardetailComponent'));
const ConsultaComponent = React.lazy(() => import('../components/admin/Consulta/ConsultaComponent'));
const CompraComponent = React.lazy(() => import('../components/admin/Compra/CompraComponent'));


const AdminRoutes = ({ authenticated }) => {
  return (
    <Protected isAuth={authenticated}>
      <Suspense fallback={<LoadingComponent />}>        
          <Routes>
            <Route path="/" element={<AdminComponent />}>
              <Route path="home" element={<HomeAdmin />} />
              <Route path="negocios" element={<NegociosComponent />} />
              <Route path="buscado" element={<BuscadoComponent />} />
              <Route path="ofertas" element={<OfertasComponent />} />
              <Route path="ofertas/:carId" element={<OfertaDetail />} />
              <Route path="tramites" element={<TramitesComponent />} />
              <Route path="vitrina" element={<AdminVitrina />} />
              <Route path='vitrina/:carId' element={<CarDetailComponent mode="admin" />} />
              <Route path="consulta" element={<ConsultaComponent />} />
              <Route path="compra" element={<CompraComponent />} />
              <Route path="dashboard" element={<DashboardComponent />} />
            </Route>
          </Routes>
        
      </Suspense>
    </Protected>
  );
};

export default AdminRoutes; 