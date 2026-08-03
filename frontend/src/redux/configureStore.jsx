import { configureStore } from "@reduxjs/toolkit";

import carsReducer from "./slices/carsSlice";
import ofertasReducer from './slices/ofertasSlice';
import loginSlice from "./slices/loginSlice";


export const store = configureStore({
  reducer: {
    cars: carsReducer,
    ofertas: ofertasReducer,
    auth: loginSlice
  }
})