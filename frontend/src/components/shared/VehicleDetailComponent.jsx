import { useState, lazy } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { formatMoney } from '../../shared/utils';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

const LoadingComponent = lazy(() => import('./loadingComponent'));

const featureRows = [
  ['Marca', 'marca'],
  ['Línea', 'linea'],
  ['Modelo', 'modelo'],
  ['Kilometraje', 'km'],
  ['Cilindraje', 'cilindraje'],
  ['Transmisión', 'transmision'],
  ['Dirección', 'direccion'],
  ['Combustible', 'combustible'],
  ['Color', 'color'],
];

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
      "price", "consignacion", "tipo", "marca", "linea", "modelo", "combustible",
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
      .put(`${apiEndpoint}/${vehicle.id}`, updatableFields)
      .then(() => {
        setEditModalOpen(false);
        reloadVehicle();
      })
      .catch((error) => console.error("Error updating vehicle:", error));
  };

  const deleteVehicle = async () => {
    if (window.confirm(`Are you sure you want to delete ${vehicle.marca} ${vehicle.linea}?`)) {
      try {
        await axios.delete(`${apiEndpoint}/${vehicle.id}`, { withCredentials: true });
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
    return <LoadingComponent />;
  }

  const metaTitle = `${vehicle.marca} ${vehicle.linea} ${vehicle.modelo} - Victoriautos`;
  const metaDescription = `${vehicle.marca} ${vehicle.linea} ${vehicle.modelo}, ${vehicle.km}km, ${vehicle.combustible}, ${vehicle.transmision}. Precio: $${formatMoney(vehicle.price)}`;
  const metaImage = `${window.location.origin}${imagePath}${vehicle.id}/${vehicle.images[0]}`;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14">
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

      {mode === 'client' && (
        <nav aria-label="breadcrumb" className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
          <Link to="/" className="!no-underline text-victoria-red hover:text-red-800">Inicio</Link>
          <span className="mx-2">/</span>
          <Link to="/vitrina" className="!no-underline text-victoria-red hover:text-red-800">Vitrina</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-500">{vehicle.marca} {vehicle.linea}</span>
        </nav>
      )}

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex gap-3">
          <div className="hidden w-20 shrink-0 flex-col gap-3 sm:flex">
            {vehicle.images.map((image, index) => (
              <div key={index} className="relative aspect-square overflow-hidden bg-zinc-100">
                {!thumbnailsLoaded[index] && <div className="absolute inset-0 animate-pulse bg-zinc-200" />}
                <img
                  src={`${imagePath}${vehicle.id}/${image}`}
                  alt={`${vehicle.marca}_${vehicle.linea}_${vehicle.modelo}_${index}`}
                  className={`h-full w-full cursor-pointer object-cover transition ${currentImage === index ? "ring-2 ring-inset ring-victoria-red" : "opacity-70 hover:opacity-100"} ${thumbnailsLoaded[index] ? 'visible' : 'invisible'}`}
                  onMouseEnter={() => setCurrentImage(index)}
                  onClick={() => setCurrentImage(index)}
                  onLoad={() => setThumbnailsLoaded(prev => ({...prev, [index]: true}))}
                />
              </div>
            ))}
          </div>
          <div className="flex-1">
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
              {!mainImageLoaded && <div className="absolute inset-0 animate-pulse bg-zinc-200" />}
              <img
                className={`h-full w-full object-contain ${mainImageLoaded ? 'visible' : 'invisible'}`}
                src={`${imagePath}${vehicle.id}/${vehicle.images[currentImage]}`}
                alt={vehicle.name}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onLoad={() => setMainImageLoaded(true)}
                style={{ touchAction: 'pinch-zoom' }}
              />
            </div>
            <div className="mt-3 flex justify-center gap-2 sm:hidden">
              {vehicle.images.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full ${currentImage === index ? 'bg-victoria-red' : 'bg-zinc-300'}`}
                  onClick={() => setCurrentImage(index)}
                  aria-label={`Imagen ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="border border-zinc-200 bg-white p-6 h-fit">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">{vehicle.modelo} · {vehicle.km} km</p>
          <h1 className="mt-2 !text-3xl font-black uppercase tracking-[-0.03em] text-victoria-dark">{vehicle.marca} {vehicle.linea}</h1>
          <p className="mt-4 border-t border-zinc-200 pt-4 text-2xl font-black text-victoria-red">${formatMoney(vehicle.price)}</p>

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
                      <td>{vehicle.wpp_check ? 'Si' : 'No'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 border border-zinc-200 bg-white p-6 sm:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-victoria-red">Características principales</p>
        <dl className="mt-5 divide-y divide-zinc-200">
          {featureRows.map(([label, key]) => (
            <div key={key} className="flex justify-between gap-4 py-3 text-sm">
              <dt className="font-bold text-zinc-500">{label}</dt>
              <dd className="font-bold text-victoria-dark">{vehicle[key]}</dd>
            </div>
          ))}
        </dl>
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
