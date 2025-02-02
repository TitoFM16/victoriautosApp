import axios from 'axios';
import { fetchOfertasStart, fetchOfertasSuccess, fetchOfertasFailure } from '../slices/ofertasSlice';

export const fetchOfertas = (queryParams) => async dispatch => {
  try {
    dispatch(fetchOfertasStart());

    let response;
    if (queryParams === undefined) {
      response = await axios.get("/api/ofertas", {
        withCredentials: true,
      });
    } else {
      response = await axios.get(`/api/ofertas?${queryParams}`, {
        withCredentials: true,
      });
    }

    const data = response.data;
    dispatch(fetchOfertasSuccess(data));
  } catch (error) {
    dispatch(fetchOfertasFailure(error));
  }
};
