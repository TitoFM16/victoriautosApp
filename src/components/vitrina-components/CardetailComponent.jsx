import { useState, useEffect, useCallback, lazy } from 'react';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { formatMoney } from '../../shared/utils';
import whatsappIcon from '../../assets/icons/whatsapp-brands-solid.svg';
import CompraModalContent from './compraModalContent';
import PropTypes from 'prop-types';
const LoadingComponent = lazy(() => import('../shared/loadingComponent'));

// Const for image paths
const imgPath = "/images/vehiculos/";

function RenderCar({ car, mode, reloadCar }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [updatedCar, setUpdatedCar] = useState({ ...car });
  const navigate = useNavigate();

  const toggleEditModal = () => setEditModalOpen(!editModalOpen);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCar({ ...updatedCar, [name]: value });
  };

  const saveChanges = () => {
    const allowedFields = [
      "price", "consignacion", "Tipo", "marca", "linea", "modelo", "combustible", 
      "cilindraje", "traccion", "direccion", "frenos", "airbag", "placa", "vin", "chasis_no",
      "motor_no", "importacion_no", "importacion_date", "status", "featured"
    ];

    const updatableFields = {};
    allowedFields.forEach((field) => {
      if (updatedCar[field] !== undefined) {
        updatableFields[field] = updatedCar[field];
      }
    });

    axios
      .put(`/api/admin/cars/${car._id}`, updatableFields)
      .then(() => {
        setEditModalOpen(false);
        reloadCar();
      })
      .catch((error) => console.error("Error updating car:", error));
  };

  const deleteCar = async () => {
    if (window.confirm(`Are you sure you want to delete ${car.marca} ${car.linea}?`)) {
      try {
        await axios.delete(`/api/admin/cars/${car._id}`, { withCredentials: true });
        alert("Car deleted successfully");
        navigate('/admin/vitrina/'); // Redirect to /admin/vitrina/ after deletion
      } catch (error) {
        console.error("Error deleting car:", error);
        alert("Failed to delete the car. Please try again.");
      }
    }
  };

  // Add new function to handle dot navigation
  const handleDotClick = (index) => {
    setCurrentImage(index);
  };

  // Add touch handling for image swapping
  const handleTouchStart = (e) => {
    // If there's more than one touch point, let the browser handle zooming
    if (e.touches.length > 1) {
      return;
    }
    
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      time: Date.now()
    });
  };

  const handleTouchMove = (e) => {
    // Ignore multi-touch events (zooming)
    if (e.touches.length > 1 || !touchStart) {
      return;
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const diff = touchStart.x - touch.clientX;
    const timeDiff = Date.now() - touchStart.time;

    // Only process as swipe if:
    // 1. Movement is significant (> 50px)
    // 2. Gesture was quick (< 300ms)
    // 3. It's a horizontal swipe (check vertical movement is minimal)
    if (Math.abs(diff) > 50 && timeDiff < 300) {
      if (diff > 0 && currentImage < car.images.length - 1) {
        // Swipe left - next image
        setCurrentImage(currentImage + 1);
      } else if (diff < 0 && currentImage > 0) {
        // Swipe right - previous image
        setCurrentImage(currentImage - 1);
      }
    }

    setTouchStart(null);
  };

  if (!car) {
    return <h3>Loading...</h3>;
  }

  return (
    <div className="container">
      <div className="row mb-2">
        <div className="col-12 col-md-9">
          <div className="container-fluid">
            <div className="row">
              {/* Desktop thumbnails - hidden on mobile */}
              <div className="col-2 d-none d-md-block">
                {car.images.map((image, index) => (
                  <div key={index} className="row vertical-center">
                    <img
                      src={`${imgPath}${car.uuid}/${image}`}
                      alt={`${car.marca}_${car.linea}_${car.modelo}_${index}`}
                      className={`card side-column-images px-0 mb-2 ${currentImage === index ? "selected" : ""}`}
                      onMouseEnter={() => setCurrentImage(index)}
                    />
                  </div>
                ))}
              </div>
              {/* Main image - full width on mobile */}
              <div className="col-12 col-md-10">
                <img
                  className="card-img-top principal-image-vitrina mx-2"
                  src={`${imgPath}${car.uuid}/${car.images[currentImage]}`}
                  alt={car.name}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ 
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    maxHeight: '600px',
                    touchAction: 'pinch-zoom' // Enable pinch-zoom
                  }}
                />
                {/* Navigation dots - visible only on mobile */}
                <div className="d-flex d-md-none justify-content-center my-2">
                  {car.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className={`dot-nav mx-1 border-0 rounded-circle ${
                        currentImage === index ? 'bg-primary' : 'bg-secondary'
                      }`}
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        padding: '0',
                        margin: '0 4px'
                      }}
                    />
                  ))}
                </div>
              
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3 card pb-2">
          <div className="card-body">
            <p className="card-text text-muted responsive-text">{car.modelo} | {car.km} km</p>
            <h3 className="card-title responsive-title">{car.marca} {car.linea}</h3>
            <h2 className="card-text display-6">${formatMoney(car.price)}</h2>

            {mode === "client" ? (
              <div className="row py-4">
                <div className="col-6">
                  <button type="button" className="btn comprar-button d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#compraModal">
                    <span className="material-symbols-outlined" style={{ marginRight: '2px' }}>
                      shopping_cart
                    </span>
                    Comprar
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn wpp-contact-button"
                    onClick={() => {
                      const currentUrl = window.location.href;
                      window.open(
                        `https://api.whatsapp.com/send?phone=573113178450&text=Hola, estoy interesado en el vehículo ${car.marca} ${car.linea} ${car.modelo}. Aquí está el enlace: ${currentUrl}`,
                        "_blank"
                      );
                    }}
                  >
                    <img src={whatsappIcon} alt="whatsapp" style={{ height: 20, width: 20 }} />
                    Contactar
                  </button>
                </div>
                <CompraModalContent car={car._id} />
              </div>
            ) : (
              <div className="row py-4">
                <div className="col-12 mb-2">
                  <button type="button" className="btn btn-warning btn-block" onClick={toggleEditModal}>
                    Editar
                  </button>
                </div>
                <div className="col-12">
                  <button type="button" className="btn btn-danger btn-block" onClick={deleteCar}>
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-9">
          <div className="card-body container-fluid ">
            <h4 className="caracteristicas-title align-items-center justify-content-center my-2 py-2">Caracteristicas Principales</h4>
            <table className="table table-striped">
              <tbody>
                <tr><th>Tipo</th><td>{car.Tipo}</td></tr>
                <tr><th>Marca</th><td>{car.marca}</td></tr>
                <tr><th>Linea</th><td>{car.linea}</td></tr>
                <tr><th>Modelo</th><td>{car.modelo}</td></tr>
                <tr><th>Cilindraje</th><td>{car.cilindraje}</td></tr>
                <tr><th>Kilometraje</th><td>{car.km}</td></tr>
                <tr><th>Transmision</th><td>{car.transmision}</td></tr>
                <tr><th>Direccion</th><td>{car.direccion}</td></tr>
                <tr><th>Combustible</th><td>{car.combustible}</td></tr>
                <tr><th>Color</th><td>{car.color}</td></tr>
                
                {/* Additional fields only shown in admin mode */}
                {mode === "admin" && (
                  <>
                    <tr><th>VIN</th><td>{car.vin || 'N/A'}</td></tr>
                    <tr><th>No. Chasis</th><td>{car.chasis_no || 'N/A'}</td></tr>
                    <tr><th>No. Motor</th><td>{car.motor_no || 'N/A'}</td></tr>
                    <tr><th>No. Importación</th><td>{car.importacion_no || 'N/A'}</td></tr>
                    <tr><th>Fecha Importación</th><td>{car.importacion_date || 'N/A'}</td></tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {mode === "admin" && editModalOpen && (
        <div className="modal show" tabIndex="-1" style={{ display: "block", backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Editar Detalles del Vehículo</h5>
                <button type="button" className="btn-close btn-close-white" onClick={toggleEditModal}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    {Object.keys(updatedCar).map((key) => (
                      <div className="col-md-6 mb-3" key={key}>
                        <label className="form-label fw-bold">{key.replace(/_/g, ' ').toUpperCase()}</label>
                        {key === 'importacion_date' ? (
                          <input
                            type="date"
                            name={key}
                            value={updatedCar[key] || ''}
                            onChange={handleInputChange}
                            className="form-control"
                          />
                        ) : key === 'featured' || key === 'consignacion' ? (
                          <select
                            name={key}
                            value={updatedCar[key]}
                            onChange={handleInputChange}
                            className="form-control"
                          >
                            <option value={true}>Sí</option>
                            <option value={false}>No</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            name={key}
                            value={updatedCar[key] || ''}
                            onChange={handleInputChange}
                            className="form-control"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={toggleEditModal}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={saveChanges}>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add prop types for RenderCar component
RenderCar.propTypes = {
  car: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    marca: PropTypes.string.isRequired,
    linea: PropTypes.string.isRequired,
    modelo: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    price: PropTypes.number.isRequired,
    km: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string,
    Tipo: PropTypes.string,
    cilindraje: PropTypes.string,
    transmision: PropTypes.string,
    direccion: PropTypes.string,
    combustible: PropTypes.string,
    color: PropTypes.string,
    vin: PropTypes.string,
    chasis_no: PropTypes.string,
    motor_no: PropTypes.string,
    importacion_no: PropTypes.string,
    importacion_date: PropTypes.string
  }).isRequired,
  mode: PropTypes.oneOf(['client', 'admin']).isRequired,
  reloadCar: PropTypes.func.isRequired
};

const CarDetailComponents = ({ car: initialCar, mode }) => {
  const [car, setCar] = useState(initialCar);
  const [isLoading, setIsLoading] = useState(!initialCar);
  const params = useParams();

  const getCar = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/cars/${params.carId}`);
      setCar(response.data);
    } catch (error) {
      console.error("Error fetching car:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.carId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!initialCar) {
      getCar();
    }
  }, [initialCar, getCar]);

  if (isLoading) {
    return (
      <LoadingComponent />
    );
  }

  if (!car) {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 text-center my-5">
            <h3>No se encontró el vehículo</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <Breadcrumb>
          <BreadcrumbItem>
            {mode === "admin" ? (
              <Link to="/admin/vitrina">vitrina</Link>
            ) : (
              <Link to="/vitrina">vitrina</Link>
            )}
          </BreadcrumbItem>
          <BreadcrumbItem active>{car?.marca} {car?.linea}</BreadcrumbItem>
        </Breadcrumb>
        <div className="col-12">
          <h3>{car?.marca} {car?.linea}</h3>
          <hr />
        </div>
      </div>

      <div className="row">
        <RenderCar car={car} mode={mode} reloadCar={getCar} />
      </div>
    </div>
  );
};

// Add prop types for CarDetailComponents component
CarDetailComponents.propTypes = {
  car: PropTypes.shape({
    _id: PropTypes.string,
    marca: PropTypes.string,
    linea: PropTypes.string
  }),
  mode: PropTypes.oneOf(['client', 'admin']).isRequired
};

export default CarDetailComponents;
