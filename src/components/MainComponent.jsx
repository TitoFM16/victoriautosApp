import { Suspense, useEffect, useState, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCars } from '../redux/actions/carsActions';
import { setAuthenticated } from '../redux/slices/loginSlice';
import { checkIfAuthenticated } from '../services/checkAuth';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingComponent from './shared/loadingComponent';

import Header from './HeaderComponent';

import Footer from './FooterComponent';
const LoginComponent = lazy(() => import('./Login/loginComponent'));
const AdminRoutes = lazy(() => import('../routes/AdminRoutes'));
const ClientRoutes = lazy(() => import('../routes/ClientRoutes'));

// Animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    rotateX: 90,
    translateY: 50
  },
  animate: {
    opacity: 1,
    rotateX: 0,
    translateY: 0
  },
  exit: {
    opacity: 0,
    rotateX: -90,
    translateY: -50
  }
};

const pageTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20
};

function Main() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedInitialCars, setHasLoadedInitialCars] = useState(false);
  const authenticated = useSelector((state) => state.auth.authenticated);
  const cars = useSelector((state) => state.cars.cars);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isAdminRoute) {
          const isAuthenticated = await checkIfAuthenticated();
          dispatch(setAuthenticated(isAuthenticated));
        }

        // Load initial cars if not loaded yet
        if (!hasLoadedInitialCars) {
          console.log('🚗 Fetching initial cars...');
          await dispatch(fetchCars(null, 4));
          setHasLoadedInitialCars(true);
          
          // Load remaining cars after initial load
          console.log('🚗 Fetching remaining cars...');
          await dispatch(fetchCars());
        }
      } catch (error) {
        console.error('❌ Error during car fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch, isAdminRoute, hasLoadedInitialCars]);

  if (isLoading) return <LoadingComponent />;

  return (
    <div className={`main-wrapper ${isAdminRoute ? '' : 'non-admin-header-wrapper'}`}>
      <Suspense fallback={<LoadingComponent />}>
        <Header />
        <main className="main-content">
          {isAdminRoute ? (
            <Routes location={location}>
              <Route path="/login" element={<LoginComponent />} />
              <Route path="/admin/*" element={<AdminRoutes authenticated={authenticated} />} />
              <Route path="/*" element={<ClientRoutes cars={cars} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Routes location={location}>
                  <Route path="/login" element={<LoginComponent />} />
                  <Route path="/admin/*" element={<AdminRoutes authenticated={authenticated} />} />
                  <Route path="/*" element={<ClientRoutes cars={cars} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          )}
          <Footer />
        </main>
      </Suspense>
    </div>
  );
}

export default Main;
