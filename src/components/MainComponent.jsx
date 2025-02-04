import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCars } from '../redux/actions/carsActions';
import { setAuthenticated } from '../redux/slices/loginSlice';
import { checkIfAuthenticated } from '../services/checkAuth';
import { AnimatePresence, motion } from 'framer-motion';
import ScrollToTop from './ScrollToTopComponent';



const AdminComponent = React.lazy(() => import('./admin/AdminComponent'));
const AdminVitrina = React.lazy(() => import('./admin/vitrina-vehiculos-component/VitrinaComponent'));
const OfertasComponent = React.lazy(() => import('./admin/ofertas-components/OfertasComponent'));
const HomeAdmin = React.lazy(() => import('./admin/Home/HomeAdminComponent'));
const TramitesComponent = React.lazy(() => import('./admin/Tramites/TramitesComponent'));
const BuscadoComponent = React.lazy(() => import('./admin/Buscado/buscado'));
const DashboardComponent = React.lazy(() => import('./admin/Dashboard/DashboardComponent'));

const CarDetailComponent = React.lazy(() => import('./vitrina-components/CardetailComponent'));

import Header from './HeaderComponent';
import Home from './home-components/HomeComponent';
import Footer from './FooterComponent';

const LoginComponent = React.lazy(() => import('./Login/loginComponent'));
const InteresFormComponent = React.lazy(() => import('./InteresFormComponent'));
const NegociosComponent = React.lazy(() => import('./admin/Negocios/NegociosComponent'));
const OfertaDetailComponent = React.lazy(() => import('./admin/ofertas-components/OfertaDetailComponent'));
const VendeForm = React.lazy(() => import('./vende-component/VendeVehiculoComponent'));
const Vitrina = React.lazy(() => import('./vitrina-components/VitrinaComponent'));

import { withRouter } from '../services/withRouter';
import Protected from './Protected';



function Main() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hasLoadedAllCars, setHasLoadedAllCars] = useState(false);
  const authenticated = useSelector((state) => state.auth.authenticated);
  const cars = useSelector((state) => state.cars.cars);
  const ofertas = useSelector((state) => state.ofertas.ofertas);
  const dispatch = useDispatch();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial load with limited cars
  useEffect(() => {
    const initialLoad = async () => {
      try {
        // Check authentication
        const isAuthenticated = await checkIfAuthenticated();
        if (isAuthenticated) {
          dispatch(setAuthenticated(true));
        } else if (isAdminRoute) {
          dispatch(setAuthenticated(false));
        }

        // Fetch initial cars with limit
        const queryParams = new URLSearchParams();
        queryParams.set('limit', isMobile ? '2' : '4');
        queryParams.set('mobile', 'true');
        await dispatch(fetchCars(queryParams.toString()));
      } catch (error) {
        console.error('Error during initial load:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialLoad();
  }, [dispatch, isAdminRoute, isMobile]);

  // Load remaining cars after initial render
  useEffect(() => {
    if (!isLoading && !hasLoadedAllCars) {
      const timer = setTimeout(() => {
        dispatch(fetchCars());
        setHasLoadedAllCars(true);
      }, 2000); // Delay loading remaining cars by 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isLoading, hasLoadedAllCars, dispatch]);

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

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
              <Suspense fallback={<div>Loading...</div>}>
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
                </Suspense>
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
              <Suspense fallback={<div>Loading...</div>}>
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
              </Suspense>
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
                <Suspense fallback={<div>Loading...</div>}>
                  <motion.div
                    key="admin"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                  <AdminComponent />
                </motion.div>
                </Suspense>
              </Protected>
            }
          >
            <Route
              path="home"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <motion.div
                    key="home"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                  <HomeAdmin />
                  </motion.div>
                </Suspense>
              }
            />
            <Route
              path="negocios"
              element={
                <Protected isAuth={authenticated}>
                  <Suspense fallback={<div>Loading...</div>}>                    
                    <motion.div
                      key="negocios"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      >
                      <NegociosComponent />
                    </motion.div>
                  </Suspense>
                </Protected>
              }
            />
            <Route
              path="buscado"
              element={
                <Protected isAuth={authenticated}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <motion.div
                      key="buscado"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                  >
                    <BuscadoComponent />
                  </motion.div>
                  </Suspense>
                </Protected>
              }
            />
            <Route
              path="ofertas"
              element={
                <Suspense fallback={<div>Loading...</div>}>                  
                  <motion.div
                    key="ofertas"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    >
                    <OfertasComponent ofertas={ofertas} />
                  </motion.div>
                  </Suspense>
              }
            />
            <Route
              path="ofertas/:ofertaId"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <motion.div
                    key="oferta"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    >
                    <OfertaWithId />
                  </motion.div>
                </Suspense>
              }
            />
            <Route
              path="tramites"
              element={
                <Suspense fallback={<div>Loading...</div>}>                  
                  <motion.div
                    key="tramites"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    >
                    <TramitesComponent />
                  </motion.div>
                </Suspense>
              }
            />
            <Route
              path="vitrina"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <motion.div
                    key="vitrina"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    >
                    <AdminVitrina />
                  </motion.div>
                </Suspense>
              }
            />
            <Route
              path="vitrina/:carId"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <motion.div
                    key="car"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    >
                    <AdminCarWithId />
                  </motion.div>
                </Suspense>
              }
            />
            <Route
              path="dashboard"
              element={
                <Protected isAuth={authenticated}>
                  <Suspense>                    
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      >
                      <DashboardComponent />
                    </motion.div>
                  </Suspense>
                </Protected>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
      <Suspense fallback={<div>Loading...</div>}>
        <Footer />
      </Suspense>
    </div>
  );
}

const MainWithRouter = withRouter(Main);
MainWithRouter.displayName = 'MainWithRouter';

export default MainWithRouter;
