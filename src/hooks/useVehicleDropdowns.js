import { useState, useEffect } from 'react';
import axios from 'axios';

export function useVehicleDropdowns() {
  const [marcaDropdown, setMarcaDropdown] = useState([]);
  const [lineaDropdown, setLineaDropdown] = useState([]);
  const tipo = 'all'; // Constant tipo 'all' to get all marcas

  // Fetch marcas on mount
  useEffect(() => {
    axios
      .get('/api/buscavehiculo/?tipo=' + tipo)
      .then((response) => {
        // Ensure we always set an array
        setMarcaDropdown(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.log('Error fetching marcas:', error);
        setMarcaDropdown([]); // Reset to empty array on error
      });
  }, []);

  // Function to fetch lineas when marca changes
  const fetchLineas = (marca) => {
    if (marca) {
      axios
        .get('/api/buscavehiculo/?tipo=' + tipo + '&marca=' + marca)
        .then((response) => {
          // Ensure we always set an array
          setLineaDropdown(Array.isArray(response.data) ? response.data : []);
        })
        .catch((error) => {
          console.log('Error fetching lineas:', error);
          setLineaDropdown([]); // Reset to empty array on error
        });
    } else {
      setLineaDropdown([]);
    }
  };

  return {
    marcaDropdown,
    lineaDropdown,
    fetchLineas
  };
} 