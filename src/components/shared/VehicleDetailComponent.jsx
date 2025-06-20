import { useState, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatMoney } from '../../shared/utils';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

const LoadingComponent = lazy(() => import('./loadingComponent'));

function VehicleDetailComponent({ 
  vehicle, 
  mode, 
  reloadVehicle, 
  imagePath, 
  apiEndpoint,
  redirectPath,
  showClientInfo = false,
  children 
}) {
  const [currentImage, setCurrentImage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [updatedVehicle, setUpdatedVehicle] = useState({ ...vehicle });
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [thumbnailsLoaded, setThumbnailsLoaded] = useState({});
  const navigate = useNavigate();

  const toggleEditModal = () => setEditModalOpen(!editModalOpen);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedVehicle({ ...updatedVehicle, [name]: value });
  };

  const saveChanges = () => {
    const allowedFields = [
      "price", "consignacion", "Tipo", "marca", "linea", "modelo", "combustible", 
      "cilindraje", "traccion", "direccion", "frenos", "airbag", "placa", "vin", 
      "chasis_no", "motor_no", "importacion_no", "importacion_date", "status", "featured"
    ];

    const updatableFields = {};
    allowedFields.forEach((field) => {
      if (updatedVehicle[field] !== undefined) {
        updatableFields[field] = updatedVehicle[field];
      }
    });

    axios
      .put(`${apiEndpoint}/${vehicle._id}`, updatableFields)
      .then(() => {
        setEditModalOpen(false);
        reloadVehicle();
      })
      .catch((error) => console.error("Error updating vehicle:", error));
  };

  const deleteVehicle = async () => {
    if (window.confirm(`Are you sure you want to delete ${vehicle.marca} ${vehicle.linea}?`)) {
      try {
        await axios.delete(`${apiEndpoint}/${vehicle._id}`, { withCredentials: true });
        alert("Vehicle deleted successfully");
        navigate(redirectPath);
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert("Failed to delete the vehicle. Please try again.");
      }
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length > 1) return;
    
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      time: Date.now()
    });
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 1 || !touchStart) return;
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const diff = touchStart.x - touch.clientX;
    const timeDiff = Date.now() - touchStart.time;

    if (Math.abs(diff) > 50 && timeDiff < 300) {
      if (diff > 0 && currentImage < vehicle.images.length - 1) {
        setCurrentImage(currentImage + 1);
      } else if (diff < 0 && currentImage > 0) {
        setCurrentImage(currentImage - 1);
      }
    }

    setTouchStart(null);
  };

  if (!vehicle) {
    return <h3>Loading...</h3>;
  }

  const metaTitle = `${vehicle.marca} ${vehicle.linea} ${vehicle.modelo} - Victoriautos`;
  const metaDescription = `${vehicle.marca} ${vehicle.linea} ${vehicle.modelo}, ${vehicle.km}km, ${vehicle.combustible}, ${vehicle.transmision}. Precio: $${formatMoney(vehicle.price)}`;
  const metaImage = `${window.location.origin}${imagePath}${vehicle.uuid}/${vehicle.images[0]}`;

  return (
    <div className="container">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
      </Helmet>

      <div className="row mb-2">
        <div className="col-12 col-md-9">
          <div className="container-fluid">
            <div className="row">
              <div className="col-2 d-none d-md-block">
                {vehicle.images.map((image, index) => (
                  <div key={index} className="row vertical-center">
                    <div className="position-relative">
                      {!thumbnailsLoaded[index] && (
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                          <LoadingComponent />
                        </div>
                      )}
                      <img
                        src={`${imagePath}${vehicle.uuid}/${image}`}
                        alt={`${vehicle.marca}_${vehicle.linea}_${vehicle.modelo}_${index}`}
                        className={`card side-column-images px-0 mb-2 ${currentImage === index ? "selected" : ""} ${thumbnailsLoaded[index] ? 'visible' : 'invisible'}`}
                        onMouseEnter={() => setCurrentImage(index)}
                        onLoad={() => setThumbnailsLoaded(prev => ({...prev, [index]: true}))}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="col-12 col-md-10">
                <div className="position-relative" style={{ minHeight: '300px' }}>
                  {!mainImageLoaded && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                      <LoadingComponent />
                    </div>
                  )}
                  <img
                    className={`card-img-top principal-image-vitrina mx-2 ${mainImageLoaded ? 'visible' : 'invisible'}`}
                    src={`${imagePath}${vehicle.uuid}/${vehicle.images[currentImage]}`}
                    alt={vehicle.name}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onLoad={() => setMainImageLoaded(true)}
                    style={{ 
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      maxHeight: '600px',
                      touchAction: 'pinch-zoom'
                    }}
                  />
                </div>
                <div className="d-flex d-md-none justify-content-center my-2">
                  {vehicle.images.map((_, index) => (
                    <button
                      key={index}
                      className={`btn btn-sm mx-1 ${currentImage === index ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setCurrentImage(index)}
                      aria-label={`Image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3 card pb-2">
          <div className="card-body">
            <p className="card-text text-muted responsive-text">{vehicle.modelo} | {vehicle.km} km</p>
            <h3 className="card-title responsive-title">{vehicle.marca} {vehicle.linea}</h3>
            <h2 className="card-text display-6">${formatMoney(vehicle.price)}</h2>

            {children}

            {mode === "admin" && (
              <div className="row py-4">
                <div className="col-6 mb-2">
                  <button type="button" className="btn btn-warning btn-block" onClick={toggleEditModal}>
                    Editar
                  </button>
                </div>
                <div className="col-6">
                  <button type="button" className="btn btn-danger btn-block" onClick={deleteVehicle}>
                    Eliminar
                  </button>
                </div>
              </div>
            )}

            {showClientInfo && (
              <div className="row py-4">
                <div className="col-12">
                  <h5>Información del Cliente</h5>
                  <table className="table">
                    <tbody>
                      <tr>
                        <th scope="row">Nombre</th>
                        <td>{vehicle.nombre} {vehicle.apellido}</td>
                      </tr>
                      <tr>
                        <th scope="row">Celular</th>
                        <td>{vehicle.celular}</td>
                      </tr>
                      <tr>
                        <th scope="row">Comunicación whatsapp?</th>
                        <td>{vehicle.wppCheck ? 'Si' : 'No'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
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
                <tr><th>Marca</th><td>{vehicle.marca}</td></tr>
                <tr><th>Linea</th><td>{vehicle.linea}</td></tr>
                <tr><th>Modelo</th><td>{vehicle.modelo}</td></tr>
                <tr><th>Kilometraje</th><td>{vehicle.km}</td></tr>
                <tr><th>Cilindraje</th><td>{vehicle.cilindraje}</td></tr>
                <tr><th>Transmision</th><td>{vehicle.transmision}</td></tr>
                <tr><th>Direccion</th><td>{vehicle.direccion}</td></tr>
                <tr><th>Combustible</th><td>{vehicle.combustible}</td></tr>
                <tr><th>Color</th><td>{vehicle.color}</td></tr>
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
                <h5 className="modal-title">Edit Vehicle Details</h5>
                <button type="button" className="btn-close" onClick={toggleEditModal}></button>
              </div>
              <div className="modal-body">
                <form>
                  {Object.keys(updatedVehicle).map((key) => (
                    <div className="mb-3" key={key}>
                      <label className="form-label">{key}</label>
                      <input
                        type="text"
                        name={key}
                        value={updatedVehicle[key] || ''}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                  ))}
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={toggleEditModal}>
                  Close
                </button>
                <button type="button" className="btn btn-primary" onClick={saveChanges}>
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

VehicleDetailComponent.propTypes = {
  vehicle: PropTypes.object.isRequired,
  mode: PropTypes.oneOf(['admin', 'client']).isRequired,
  reloadVehicle: PropTypes.func.isRequired,
  imagePath: PropTypes.string.isRequired,
  apiEndpoint: PropTypes.string.isRequired,
  redirectPath: PropTypes.string.isRequired,
  showClientInfo: PropTypes.bool,
  children: PropTypes.node
};

export default VehicleDetailComponent; 