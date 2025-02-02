import { configureStore } from "@reduxjs/toolkit";
import { createLogger } from 'redux-logger';

import carsReducer from "./slices/carsSlice";
import ofertasReducer from './slices/ofertasSlice';
import loginSlice from "./slices/loginSlice";

// Create the logger middleware
const logger = createLogger();

export const store = configureStore({
  reducer: {
    cars: carsReducer,
    ofertas: ofertasReducer,
    authenticated: loginSlice
  }
//  ,
//  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger)
})