//Component that renders the tramites page in a striped table. It also has a button to add a new tramite, which is a modal form.

import { useState, useEffect } from 'react';
import {Link} from 'react-router-dom'


import axios from 'axios';

const TramitesComponent = () => {
    const [loading, setLoading] = useState(true);
    const [tramites, setTramites] = useState([]);

    // Similar to componentDidMount and componentDidUpdate:  
    useEffect(() => {    
        const fetchData = async () =>{
            setLoading(true);
            try {
              await axios.get('/api/tramites')
                  .then(response => {
                      setTramites(response.data);
                      console.log(response.data);
                  }) 
              
            } catch (error) {
              console.error(error.message);
            }
            setLoading(false);
        }
      
        fetchData();

    }, []);

    const eliminarTramite = (id) => {
        axios.delete('/api/tramites/' + id)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.log(error);
            })
        setTramites(tramites.filter(el => el._id !== id));
    }

    // if loading is true, show loading message
    if (loading) {
        return <div className="container">
            <div className="row">
                <div className="col-12">
                    <h3>Loading...</h3>
                </div>
            </div>
        </div>
    }
    
    return(
        //render the table with the tramites
        // if loading is false then render the table
        // else render a loading message
        

        <div className="container">
            <div className="row">
                <div className="col-12">
                    <h3>Tramites</h3>
                    <hr/>
                </div>
            </div>
            <div className="row">
                <table className="table table-striped rounded rounded-3">
                    <thead>
                        <tr>
                            <th scope="col">Marca</th>
                            <th scope="col">Linea</th>
                            <th scope="col">Placa</th>
                            <th scope="col">Tramitador</th>
                            <th scope="col">Estado</th>

                        </tr>
                    </thead>
                    <tbody>

                        {tramites.map((tramite) => {
                            return(
                                <tr key={tramite._id}>  
                                    <td>{tramite.car.marca}</td>
                                    <td>{tramite.car.linea}</td>
                                    <td>{tramite.car.placa}</td>
                                    <td>{tramite.tramitador}</td>
                                    <td>{tramite.estado}</td>
                                    {/* Buttons for edit and delete, without bootstrap basic style */}
                                    <td>
                                        <Link to={"/admin/tramites/edit/" + tramite._id} className="btn btn-outline-primary">Editar</Link>
                                    </td>
                                    <td>
                                        <button className="btn btn-outline-danger" onClick={() => {eliminarTramite(tramite._id)}}>Eliminar</button>
                                    </td>
                                </tr>
                            );
                        })}

                    </tbody>
                </table>
            </div>
        </div>
    );

}

export default TramitesComponent;