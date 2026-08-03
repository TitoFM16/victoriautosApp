import { createSlice } from "@reduxjs/toolkit";

const loginSlice = createSlice({
  name: 'login',
  initialState: {
    authenticated: false
  },
  reducers: {
    setAuthenticated: (state, action) => {
      state.authenticated = action.payload;
    }
  }
});

export const { setAuthenticated } = loginSlice.actions;
export default loginSlice.reducer;