// --------------------------------------------------
//--------Bootstrap ---------------------------------

import '../src/styles/custom-bootstrap.scss'; 
import { Modal, Dropdown, Collapse } from 'bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';
//import 'bootstrap/dist/js/bootstrap.bundle.min';

// --------------------------------------------------
//--------Bootstrap ---------------------------------


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
