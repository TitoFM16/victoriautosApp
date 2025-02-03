import axios from 'axios';

export const checkIfAuthenticated = async () => {
  try {
    const response = await axios.get('/api/users/check-auth-cookie', {
      withCredentials: true // Important for sending cookies
    });

    return response.data.authenticated;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}; 