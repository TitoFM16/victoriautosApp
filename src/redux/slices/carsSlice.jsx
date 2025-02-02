import { createSlice } from "@reduxjs/toolkit";


const carsSlice = createSlice({
  name: "cars",
  initialState: {
    cars: [],
    loading: false,
    error: null
  },
  reducers: {
    fetchCarsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCarsSuccess(state, action) {
      state.cars = action.payload;
      state.loading = false;
    },
    fetchCarsFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { fetchCarsStart, fetchCarsSuccess, fetchCarsFailure } = carsSlice.actions;

export default carsSlice.reducer;
