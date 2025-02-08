import { useEffect } from 'react';
import Main from './components/MainComponent';
import ScrollToTop from './components/ScrollToTopComponent';
import './App.css';
import {BrowserRouter, Routes, Route, useLocation} from 'react-router-dom';
import {Provider} from 'react-redux';
import {store} from './redux/configureStore';
import { HelmetProvider } from 'react-helmet-async';

import { pageView } from "./utils/analytics";

// Create a wrapper component to handle analytics
function AnalyticsWrapper() {
  const location = useLocation();

  useEffect(() => {
    pageView(location.pathname);
  }, [location]);

  return null;
}

function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>  
        <BrowserRouter>
          <AnalyticsWrapper />
          <ScrollToTop />
          <Main />
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  );
}

export default App;
