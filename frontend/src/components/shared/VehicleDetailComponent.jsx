import { useState, useEffect, useMemo, lazy } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { formatMoney } from '../../shared/utils';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import VehicleImage from './VehicleImage';
import VehicleCard from './VehicleCard';

const LoadingComponent = lazy(() => import('./loadingComponent'));

// [label, key, material symbol]. Only public car fields (never vin/chasis/motor/etc.).
const specTiles = [
  ['Marca', 'marca', 'directions_car'],
  ['Línea', 'linea', 'label'],
  ['Modelo', 'modelo', 'calendar_month'],
  ['Kilometraje', 'km', 'speed'],
  ['Cilindraje', 'cilindraje', 'settings'],
  ['Transmisión', 'transmision', 'manage_history'],
  ['Dirección', 'direccion', 'tune'],
  ['Combustible', 'combustible', 'local_gas_station'],
  ['Tracción', 'traccion', 'route'],
  ['Frenos', 'frenos', 'stop_circle'],
  ['Airbag', 'airbag', 'health_and_safety'],
  ['Color', 'color', 'palette'],
  ['Matrícula', 'matricula', 'badge'],
];

// Admin keeps the original compact table.
const featureRows = specTiles
  .filter(([, key]) => ['marca', 'linea', 'modelo', 'km', 'cilindraje', 'transmision', 'direccion', 'combustible', 'color'].includes(key))
  .map(([label, key]) => [label, key]);

const toNumber = (value) => {
  const parsed = parseFloat(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== '';

const formatSpec = (key, value) => {
  if (key === 'km') {
    const n = toNumber(value);
    return n === null ? String(value) : `${n.toLocaleString('es-CO')} km`;
  }
  return String(value);
};

function VehicleDetailComponent({
  vehicle,
  mode,
  reloadVehicle,
  imagePath,
  apiEndpoint,
  redirectPath,
  showClientInfo = false,
  mobileBar = null,
  children
}) {
  const [currentImage, setCurrentImage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [updatedVehicle, setUpdatedVehicle] = useState({ ...vehicle });
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [thumbnailsLoaded, setThumbnailsLoaded] = useState({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [portraitMap, setPortraitMap] = useState({});
  const allCars = useSelector((state) => state.cars?.cars);
  const navigate = useNavigate();

  const imageCount = vehicle?.images?.length || 0;

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setCurrentImage((i) => Math.min(i + 1, imageCount - 1));
      if (e.key === 'ArrowLeft') setCurrentImage((i) => Math.max(i - 1, 0));
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [lightboxOpen, imageCount]);

  const similarCars = useMemo(() => {
    if (!vehicle || !Array.isArray(allCars)) return [];
    const price = toNumber(vehicle.price);
    return allCars
      .filter((c) => String(c.id) !== String(vehicle.id))
      .map((c) => {
        const cp = toNumber(c.price);
        const diff = price && cp ? Math.abs(cp - price) / price : 1;
        const sameTipo = c.tipo && c.tipo === vehicle.tipo;
        return { car: c, score: (sameTipo ? 0 : 1) + diff };
      })
      .filter(({ score }) => score < 1.35)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(({ car }) => car);
  }, [allCars, vehicle]);

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

  if (mode === 'client') {
    const images = vehicle.images || [];
    const total = images.length;
    const srcAt = (i) => (images[i] ? `${imagePath}${vehicle.id}/${images[i]}` : undefined);
    const goPrev = () => setCurrentImage((i) => Math.max(i - 1, 0));
    const goNext = () => setCurrentImage((i) => Math.min(i + 1, total - 1));
    const title = `${vehicle.marca} ${vehicle.linea}`;
    const kmNumber = toNumber(vehicle.km);
    const chips = [
      hasValue(vehicle.modelo) && { icon: 'calendar_month', text: String(vehicle.modelo) },
      kmNumber !== null && { icon: 'speed', text: `${kmNumber.toLocaleString('es-CO')} km` },
      hasValue(vehicle.transmision) && { icon: 'manage_history', text: vehicle.transmision },
      hasValue(vehicle.combustible) && { icon: 'local_gas_station', text: vehicle.combustible },
    ].filter(Boolean);
    const tiles = specTiles.filter(([, key]) => hasValue(vehicle[key]));

    return (
      <div className="public-vehicle-detail vd-page">
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

        <nav aria-label="breadcrumb" className="vd-breadcrumb">
          <Link to="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <Link to="/vitrina">Vitrina</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{title}</span>
        </nav>

        <div className="vd-grid">
          <section className="vd-gallery" aria-label="Galería de fotos">
            <div
              className="vd-stage"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {srcAt(currentImage) ? (
                <button
                  type="button"
                  className="vd-stage-btn"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Ampliar foto"
                >
                  <img
                    key={currentImage}
                    className={portraitMap[currentImage] ? 'is-portrait' : ''}
                    src={srcAt(currentImage)}
                    alt={`${title}, modelo ${vehicle.modelo}, foto ${currentImage + 1}`}
                    fetchPriority={currentImage === 0 ? 'high' : undefined}
                    onLoad={(e) => {
                      const { naturalWidth, naturalHeight } = e.currentTarget;
                      setPortraitMap((prev) => (
                        prev[currentImage] === (naturalHeight > naturalWidth) ? prev : { ...prev, [currentImage]: naturalHeight > naturalWidth }
                      ));
                    }}
                    style={{ touchAction: 'pan-y pinch-zoom' }}
                  />
                </button>
              ) : (
                <span className="vd-stage-empty">Imagen próximamente</span>
              )}
              {total > 1 && (
                <>
                  <button type="button" className="vd-nav vd-prev" onClick={goPrev} disabled={currentImage === 0} aria-label="Foto anterior">
                    <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
                  </button>
                  <button type="button" className="vd-nav vd-next" onClick={goNext} disabled={currentImage === total - 1} aria-label="Foto siguiente">
                    <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                  </button>
                  <span className="vd-counter" aria-live="polite">{currentImage + 1} / {total}</span>
                </>
              )}
            </div>
            {total > 1 && (
              <div className="vd-thumbs">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className={`vd-thumb ${currentImage === index ? 'is-active' : ''}`}
                    aria-label={`Ver foto ${index + 1}`}
                    aria-pressed={currentImage === index}
                    onClick={() => setCurrentImage(index)}
                  >
                    <img src={srcAt(index)} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="vd-summary">
            <Link to="/vitrina" className="vd-back">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              Vitrina
            </Link>
            <h1 className="vd-title">{title}</h1>
            <ul className="vd-chips">
              {chips.map((chip) => (
                <li key={chip.icon}>
                  <span className="material-symbols-outlined" aria-hidden="true">{chip.icon}</span>
                  {chip.text}
                </li>
              ))}
            </ul>
            <p className="vd-price">$ {formatMoney(vehicle.price)}</p>
            {children}
          </aside>

          <section className="vd-specs" aria-labelledby="vd-specs-title">
            <h2 id="vd-specs-title">Características principales</h2>
            <dl className="vd-spec-grid">
              {tiles.map(([label, key, icon]) => (
                <div key={key} className="vd-spec">
                  <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
                  <div>
                    <dt>{label}</dt>
                    <dd>{formatSpec(key, vehicle[key])}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {similarCars.length > 0 && (
          <section className="vd-similar" aria-labelledby="vd-similar-title">
            <h2 id="vd-similar-title">Vehículos similares</h2>
            <div className="vd-similar-grid">
              {similarCars.map((c) => (
                <VehicleCard key={c.id} car={c} />
              ))}
            </div>
          </section>
        )}

        {mobileBar}

        {lightboxOpen && total > 0 && (
          <div className="vd-lightbox" role="dialog" aria-modal="true" aria-label="Galería ampliada">
            <button type="button" className="vd-lightbox-backdrop" onClick={() => setLightboxOpen(false)} aria-label="Cerrar galería" tabIndex={-1} />
            <button type="button" className="vd-lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Cerrar galería" autoFocus>
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
            <img
              src={srcAt(currentImage)}
              alt={`${title}, foto ${currentImage + 1} de ${total}`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            />
            {total > 1 && (
              <>
                <button type="button" className="vd-nav vd-prev" onClick={goPrev} disabled={currentImage === 0} aria-label="Foto anterior">
                  <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
                </button>
                <button type="button" className="vd-nav vd-next" onClick={goNext} disabled={currentImage === total - 1} aria-label="Foto siguiente">
                  <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                </button>
                <span className="vd-counter">{currentImage + 1} / {total}</span>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${mode === 'client' ? 'public-vehicle-detail' : ''} mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14`}>
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
        {mode === 'admin' ? (
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
        ) : (
          <div className="flex gap-3">
            <div className="hidden w-20 shrink-0 flex-col gap-3 sm:flex">
              {vehicle.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={`vehicle-thumbnail ${currentImage === index ? 'is-active' : ''}`}
                  aria-label={`Ver imagen ${index + 1}`}
                  aria-pressed={currentImage === index}
                  onMouseEnter={() => setCurrentImage(index)}
                  onClick={() => setCurrentImage(index)}
                >
                  <VehicleImage
                    src={`${imagePath}${vehicle.id}/${image}`}
                    alt={`${vehicle.marca}_${vehicle.linea}_${vehicle.modelo}_${index}`}
                  />
                </button>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <VehicleImage
                className="vehicle-detail-media"
                src={vehicle.images[currentImage] ? `${imagePath}${vehicle.id}/${vehicle.images[currentImage]}` : undefined}
                alt={`${vehicle.marca} ${vehicle.linea}, modelo ${vehicle.modelo}`}
                eager
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'pinch-zoom' }}
              />
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:hidden">
                {vehicle.images.map((_, index) => (
                  <button
                    key={index}
                    className={`vehicle-gallery-dot ${currentImage === index ? 'is-active' : ''}`}
                    onClick={() => setCurrentImage(index)}
                    aria-label={`Imagen ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_18px_50px_rgba(17,19,21,0.06)]">
          {mode === 'client' ? (
            <div className="vehicle-chips">
              <span>{vehicle.modelo}</span><span>{Number(vehicle.km).toLocaleString('es-CO')} km</span>
            </div>
          ) : (
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">{vehicle.modelo} · {Number(vehicle.km).toLocaleString('es-CO')} km</p>
          )}
          <h1 className="mt-2 !text-3xl font-black uppercase tracking-[-0.03em] text-victoria-dark">{vehicle.marca} {vehicle.linea}</h1>
          <p className="mt-4 border-t border-zinc-200 pt-4 text-2xl font-black text-victoria-red">$ {formatMoney(vehicle.price)}</p>

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

      <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_18px_50px_rgba(17,19,21,0.05)] sm:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-victoria-red">Características principales</p>
        <dl className="mt-5 divide-y divide-zinc-200">
          {featureRows.map(([label, key]) => (
            <div key={key} className="flex justify-between gap-4 py-3 text-sm">
              <dt className="font-bold text-zinc-500">{label}</dt>
              <dd className="font-bold text-victoria-dark">{key === 'km' ? Number(vehicle[key]).toLocaleString('es-CO') : vehicle[key]}</dd>
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
  mobileBar: PropTypes.node,
  children: PropTypes.node
};

export default VehicleDetailComponent;
