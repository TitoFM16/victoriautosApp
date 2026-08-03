import axios from 'axios';
import { setAuthenticated } from '../slices/loginSlice';

export const login = (username, password) => async (dispatch) => {
  try {
    const response = await axios.post('/api/users/login', 
      { username, password },
      { withCredentials: true } // Important for receiving cookies
    );

    if (response.data.success) {
      dispatch(setAuthenticated(true));
      return response.data;
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    dispatch(setAuthenticated(false));
    throw error;
  }
};

export const logout = () => async (dispatch) => {
  try {
    await axios.post('/users/logout', {}, { withCredentials: true });
    dispatch(setAuthenticated(false));
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}; 