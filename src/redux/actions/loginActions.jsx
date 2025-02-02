import { setAuthenticated } from '../slices/loginSlice';

// Action creator for logging in
export const login = (username, password) => async dispatch => {
  try {
    // Send a request to the server to log in
    // const response = await fetch(baseUrl+'users/login', {
      const response = await fetch('/api/users/login', {
      // const response = await fetch(baseUrl+'users/login', {  

      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();

    // If the login was successful, store the JWT token in localstorage and dispatch the setAuthenticated action
    if (response.ok) {
      // console.log('response',response)
      // document.cookie = `token=${data.token};secure;httpOnly`;
      // document.cookie = `token=${data.token}`;
      // localStorage.setItem('token', data.token);
      dispatch(setAuthenticated(true));
    } else {
      // If the login was unsuccessful, throw an error
      throw new Error(data.message);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const logout =() => async dispatch =>{
  try {
    // Send a request to the server to log out
      const response = await fetch('/api/users/logout', { 

      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },

    });
    const data = await response.json();

    // If the login was successful, store the JWT token in localstorage and dispatch the setAuthenticated action
    if (response.ok) {
      console.log('response',response)
      dispatch(setAuthenticated(false));

    } else {
      // If the login was unsuccessful, throw an error
      throw new Error(data.message);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}