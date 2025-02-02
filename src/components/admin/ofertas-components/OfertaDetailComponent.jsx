import React, { useState, useEffect } from 'react';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import { formatMoney } from '../../../shared/utils';

// import CompraModalContent from './compraModalContent';

// Const for image paths
const imgPath = "/images/ofertas/";

function RenderOferta({ oferta, mode, reloadOferta }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [updatedCar, setUpdatedCar] = useState({ ...oferta });
  const navigate = useNavigate(); // Hook for navigation

  const toggleEditModal = () => setEditModalOpen(!editModalOpen);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCar({ ...updatedCar, [name]: value });
  };

  const saveChanges = () => {
    const allowedFields = [
      "price", "consignacion", "Tipo", "marca", "linea", "modelo", "combustible", 
      "cilindraje", "traccion", "direccion", "frenos", "airbag", "placa", 
      "status", "featured"
    ];

    const updatableFields = {};
    allowedFields.forEach((field) => {
      if (updatedCar[field] !== undefined) {
        updatableFields[field] = updatedCar[field];
      }
    });

    axios
      .put(`/api/cars/${oferta._id}`, updatableFields)
      .then(() => {
        setEditModalOpen(false);
        reloadOferta();
      })
      .catch((error) => console.error("Error updating oferta:", error));
  };

  const deleteOferta = async () => {
    if (window.confirm(`Are you sure you want to delete ${oferta.marca} ${oferta.linea}?`)) {
      try {
        await axios.delete(`/api/ofertas/${oferta._id}`, { withCredentials: true });
        alert("Oferta deleted successfully");
        navigate('/admin/ofertas/'); // Redirect to /admin/vitrina/ after deletion
      } catch (error) {
        console.error("Error deleting oferta:", error);
        alert("Failed to delete the oferta. Please try again.");
      }
    }
  };

  if (!oferta) {
    return <h3>Loading...</h3>;
  }

  return (
    <div className="container">
      <div className="row mb-2">
        <div className="col-12 col-md-9">
          <div className="container-fluid">
            <div className="row">
              <div className="col-2">
                {oferta.images.map((image, index) => (
                  <div key={index} className="row vertical-center">
                    <img
                      src={`${imgPath}${oferta.uuid}/${image}`}
                      alt={`${oferta.marca}_${oferta.linea}_${oferta.modelo}_${index}`}
                      className={`card side-column-images px-0 mb-2 ${currentImage === index ? "selected" : ""}`}
                      onMouseEnter={() => setCurrentImage(index)}
                    />
                  </div>
                ))}
              </div>
              <div className="col-10">
                <img
                  className="card-img-top principal-image-vitrina mx-2"
                  src={`${imgPath}${oferta.uuid}/${oferta.images[currentImage]}`}
                  alt={oferta.name}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3 card pb-2">
          <div className="card-body">
            <p className="card-text text-muted responsive-text">{oferta.modelo} | {oferta.km} km</p>
            <h3 className="card-title responsive-title">{oferta.marca} {oferta.linea}</h3>
            <h2 className="card-text display-6">${formatMoney(oferta.price)}</h2>

            {mode === "client" ? (
              <div className="row py-4">
                <div className="col-6">
                  <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#compraModal">
                    Comprar
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-success btn-block"
                    onClick={() => window.open(`https://api.whatsapp.com/send?phone=573113178450&text=Hola, estoy interesado en el vehículo ${oferta.marca} ${oferta.linea} ${oferta.modelo}`, "_blank")}
                  >
                    {/* <img src={whatsappIcon} alt="whatsapp" style={{ height: 20, width: 20 }} className="whatsapp-icon" /> */}
                    Contactar
                  </button>
                </div>
                {/* <CompraModalContent oferta={oferta._id} /> */}
              </div>
            ) : (
            <React.Fragment>
              <div className="row py-4">
                <div className="col-6 mb-2">
                  <button type="button" className="btn btn-warning btn-block" onClick={toggleEditModal}>
                    Editar
                  </button>
                </div>
                <div className="col-6">
                  <button type="button" className="btn btn-danger btn-block" onClick={deleteOferta}>
                    Eliminar
                  </button>
                </div>
              </div>
            <div className="row py-4">
              <div className="col-12">
                <h5>Información del Cliente</h5>
                <table className="table">
                  <tbody>
                    <tr>
                      <th scope="row">Nombre</th>
                      <td>{oferta.nombre} {oferta.apellido}</td>
                    </tr>
                    <tr>
                      <th scope="row">Celular</th>
                      <td>{oferta.celular}</td>
                    </tr>
                    <tr>
                      <th scope="row">Comunicación whatsapp?</th>
                      <td>{oferta.wppCheck ? 'Si' : 'No'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            </React.Fragment>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-9">
          <div className="card-body">
            <h4 className="card-title">Caracteristicas Principales</h4>
            <table className="table table-striped">
              <tbody>

                <tr><th>Marca</th><td>{oferta.marca}</td></tr>
                <tr><th>Linea</th><td>{oferta.linea}</td></tr>
                <tr><th>Modelo</th><td>{oferta.modelo}</td></tr>
                <tr><th>Kilometraje</th><td>{oferta.km}</td></tr>
                <tr><th>Cilindraje</th><td>{oferta.cilindraje}</td></tr>
                <tr><th>Transmision</th><td>{oferta.transmision}</td></tr>
                <tr><th>Direccion</th><td>{oferta.direccion}</td></tr>
                <tr><th>Combustible</th><td>{oferta.combustible}</td></tr>
                <tr><th>Color</th><td>{oferta.color}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {mode === "admin" && editModalOpen && (
        <div className={`modal show`} tabIndex="-1" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Oferta Details</h5>
                <button type="button" className="btn-close" onClick={toggleEditModal}></button>
              </div>
              <div className="modal-body">
                <form>
                  {Object.keys(updatedCar).map((key) => (
                    <div className="mb-3" key={key}>
                      <label className="form-label">{key}</label>
                      <input
                        type="text"
                        name={key}
                        value={updatedCar[key]}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                  ))}
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={toggleEditModal}>Cancel</button>
                <button type="button" className="btn btn-success" onClick={saveChanges}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const OfertaDetailComponent = ({ oferta: initialCar, mode }) => {
  const [oferta, setCar] = useState(initialCar);
  const params = useParams();

  const getCar = async () => {
    try {
      const response = await axios.get(`/api/cars/${params.carId}`);
      setCar(response.data);
    } catch (error) {
      console.error("Error fetching oferta:", error);
    }
  };

  useEffect(() => {
    if (!initialCar) {
      getCar();
    }
  }, [initialCar]);

  return (
    <div className="container">
      <div className="row">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/vitrina">vitrina</Link>
          </BreadcrumbItem>
          <BreadcrumbItem active>{oferta?.marca} {oferta?.linea}</BreadcrumbItem>
        </Breadcrumb>
        <div className="col-12">
          <h3>{oferta?.marca} {oferta?.linea}</h3>
          <hr />
        </div>
      </div>

      <div className="row">
        <RenderOferta oferta={oferta} mode={mode} reloadOferta={getCar} />
      </div>
    </div>
  );
};

export default OfertaDetailComponent;
