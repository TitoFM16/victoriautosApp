import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCars } from '../redux/actions/carsActions';
import { setAuthenticated } from '../redux/slices/loginSlice';
import { checkIfAuthenticated } from '../services/checkAuth';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingComponent from './shared/loadingComponent';

const Header = React.lazy(() => import('./HeaderComponent'));
const Footer = React.lazy(() => import('./FooterComponent'));
const LoginComponent = React.lazy(() => import('./Login/loginComponent'));
const AdminRoutes = React.lazy(() => import('../routes/AdminRoutes'));
const ClientRoutes = React.lazy(() => import('../routes/ClientRoutes'));

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
  const authenticated = useSelector((state) => state.auth.authenticated);
  const cars = useSelector((state) => state.cars.cars);
  const dispatch = useDispatch();

  useEffect(() => {
    const initialLoad = async () => {
      try {
        const isAuthenticated = await checkIfAuthenticated();
        if (isAuthenticated) {
          dispatch(setAuthenticated(true));
        } else if (isAdminRoute) {
          dispatch(setAuthenticated(false));
        }
        await dispatch(fetchCars());
      } catch (error) {
        console.error('Error during initial load:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialLoad();
  }, [dispatch, isAdminRoute]);

  if (isLoading) return <LoadingComponent />;

  return (
    <div className={isAdminRoute ? '' : 'non-admin-header-wrapper'}>
      <Suspense fallback={<LoadingComponent />}>
        <Header />
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
        <Footer />
      </Suspense>
    </div>
  );
}

export default Main;
