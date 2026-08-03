import { createSlice } from "@reduxjs/toolkit";


const ofertasSlice = createSlice({
  name: "ofertas",
  initialState: {
    ofertas: [],
    loading: false,
    error: null
  },
  reducers: {
    fetchOfertasStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchOfertasSuccess(state, action) {
      state.ofertas = action.payload;
      state.loading = false;
    },
    fetchOfertasFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { fetchOfertasStart, fetchOfertasSuccess, fetchOfertasFailure } = ofertasSlice.actions;

export default ofertasSlice.reducer;
