import { fetchCarsStart, fetchCarsSuccess, fetchCarsFailure } from '../slices/carsSlice';

export const fetchCars = (queryParams, limit) => async (dispatch) => {
  try {
    dispatch(fetchCarsStart());

    // Set up the request options
    const options = {
      method: 'GET',
      credentials: 'include', // Include credentials (cookies, etc.)
    };

    // Construct the URL with limit parameter if provided
    const baseUrl = queryParams ? `/api/cars?${queryParams}` : '/api/cars';
    const url = limit ? `${baseUrl}${queryParams ? '&' : '?'}limit=${limit}` : baseUrl;

    // Make the fetch request with credentials
    const response = await fetch(url, options);

    // Check for errors
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    dispatch(fetchCarsSuccess(data));
  } catch (error) {
    dispatch(fetchCarsFailure(error.toString()));
  }
};
