import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCars } from '../redux/actions/carsActions';
import { setAuthenticated } from '../redux/slices/loginSlice';
import { checkIfAuthenticated } from '../services/checkAuth';
import { AnimatePresence, motion } from 'framer-motion';
import ScrollToTop from './ScrollToTopComponent';

import AdminComponent from './admin/AdminComponent';
import AdminVitrina from './admin/vitrina-vehiculos-component/VitrinaComponent';
import OfertasComponent from './admin/ofertas-components/OfertasComponent';
import CarDetailComponent from './vitrina-components/CardetailComponent';
import Footer from './FooterComponent';
import Header from './HeaderComponent';
import Home from './home-components/HomeComponent';
import HomeAdmin from './admin/Home/HomeAdminComponent';
import InteresFormComponent from './InteresFormComponent';
import LoginComponent from './Login/loginComponent';
import NegociosComponent from './admin/Negocios/NegociosComponent';
import OfertaDetailComponent from './admin/ofertas-components/OfertaDetailComponent';
import TramitesComponent from './admin/Tramites/TramitesComponent';
import VendeForm from './vende-component/VendeVehiculoComponent';
import Vitrina from './vitrina-components/VitrinaComponent';
import BuscadoComponent from './admin/Buscado/buscado';
import DashboardComponent from './admin/Dashboard/DashboardComponent';

import { withRouter } from '../services/withRouter';

function Protected({ isAuth, children }) {
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Main() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const authenticated = useSelector((state) => state.authenticated);
  const cars = useSelector((state) => state.cars.cars);
  const ofertas = useSelector((state) => state.ofertas.ofertas);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCars());
    
    // Only check authentication if on admin route
    if (isAdminRoute) {
      checkIfAuthenticated().then((isAuthenticated) => {
        if (isAuthenticated) {
          dispatch(setAuthenticated(true));
        }
      });
    }
  }, [isAdminRoute, dispatch]); // Add isAdminRoute to dependencies

  const CarWithId = () => {
    let params = useParams();
    return (
      <CarDetailComponent
        mode="client"
        car={cars.length === 0 ? null : cars.filter((car) => car._id === params.carId)[0]}
      />
    );
  };

  const AdminCarWithId = () => {
    let params = useParams();
    return (
      <CarDetailComponent
        mode="admin"
        car={cars.length === 0 ? null : cars.filter((car) => car._id === params.carId)[0]}
      />
    );
  };

  const OfertaWithId = () => {
    let params = useParams();
    return (
      <OfertaDetailComponent
        oferta={ofertas.filter((oferta) => oferta._id === params.ofertaId)[0]}
      />
    );
  };

  return (
    <div className={isAdminRoute ? '' : 'non-admin-header-wrapper'}>
      <Header/>
      <AnimatePresence mode="wait">
        <ScrollToTop key="scroll-top" />
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route
            path="/"
            element={
              <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                initial: { duration: 1 },
                animate: { duration: 2 },
                exit: { duration: 1.5 },
              }}
              >
                <Home />
              </motion.div>
            }
          />
          <Route
            exact
            path="/vitrina"
            element={
              <motion.div
                key="vitrina"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                initial: { duration: 1 },
                animate: { duration: 2 },
                exit: { duration: 0.5 },
              }}
              >
                <Vitrina cars={cars} />
              </motion.div>
            }
          />
          <Route
            path="/vitrina/:carId"
            element={
              <motion.div
                key="car"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                initial: { duration: 1 },
                animate: { duration: 2 },
                exit: { duration: 0.5 },
              }}
              >
                <CarWithId />
              </motion.div>
            }
          />
          <Route
            path="/vende"
            element={
              <motion.div
                key="vende"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                initial: { duration: 1 },
                animate: { duration: 2 },
                exit: { duration: 0.5 },
              }}
              >
                <VendeForm />
              </motion.div>
            }
          />
          <Route
            path="/interes"
            element={
              <motion.div
                key="interes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                initial: { duration: 1 },
                animate: { duration: 2 },
                exit: { duration: 0.5 },
              }}
              >
                <InteresFormComponent />
              </motion.div>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected isAuth={authenticated}>
                <motion.div
                  key="admin"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AdminComponent />
                </motion.div>
              </Protected>
            }
          >
            <Route
              path="home"
              element={
                <motion.div
                  key="home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <HomeAdmin />
                </motion.div>
              }
            />
            <Route
              path="negocios"
              element={
                <Protected isAuth={authenticated}>
                  <motion.div
                    key="negocios"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <NegociosComponent />
                  </motion.div>
                </Protected>
              }
            />
            <Route
              path="buscado"
              element={
                <Protected isAuth={authenticated}>
                  <motion.div
                    key="buscado"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <BuscadoComponent />
                  </motion.div>
                </Protected>
              }
            />
            <Route
              path="ofertas"
              element={
                <motion.div
                  key="ofertas"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <OfertasComponent ofertas={ofertas} />
                </motion.div>
              }
            />
            <Route
              path="ofertas/:ofertaId"
              element={
                <motion.div
                  key="oferta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <OfertaWithId />
                </motion.div>
              }
            />
            <Route
              path="tramites"
              element={
                <motion.div
                  key="tramites"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <TramitesComponent />
                </motion.div>
              }
            />
            <Route
              path="vitrina"
              element={
                <motion.div
                  key="vitrina"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AdminVitrina />
                </motion.div>
              }
            />
            <Route
              path="vitrina/:carId"
              element={
                <motion.div
                  key="car"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AdminCarWithId />
                </motion.div>
              }
            />
            <Route
              path="dashboard"
              element={
                <Protected isAuth={authenticated}>
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <DashboardComponent />
                  </motion.div>
                </Protected>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default withRouter(Main);