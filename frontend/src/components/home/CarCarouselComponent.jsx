import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

const imagePath = '/images/vehiculos/';

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function CarCarousel() {
  const { cars, loading, error } = useSelector((state) => state.cars);
  const [imagesLoaded, setImagesLoaded] = useState({});

  const sortedCars = [...cars].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  return (
    <section className="bg-victoria-cream py-20 sm:py-28" aria-labelledby="latest-vehicles-title">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="mb-10 flex flex-col gap-6 border-b border-zinc-300 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-victoria-red">Recién llegados</p>
            <h2 id="latest-vehicles-title" className="mt-3 !text-4xl font-black leading-none tracking-[-0.05em] text-victoria-dark sm:!text-6xl">
              Vehículos para conocer.
            </h2>
          </div>
          <Link to="/vitrina" className="w-fit border-b-2 border-victoria-dark pb-2 text-xs font-black uppercase tracking-[0.16em] text-victoria-dark no-underline transition hover:border-victoria-red hover:text-victoria-red">
            Ver inventario completo →
          </Link>
        </div>

        {loading && cars.length === 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cargando vehículos">
            {[0, 1, 2].map((item) => (
              <div key={item} className="animate-pulse bg-white">
                <div className="aspect-[16/10] bg-zinc-200" />
                <div className="space-y-4 p-6"><div className="h-4 w-24 bg-zinc-200" /><div className="h-7 w-4/5 bg-zinc-200" /><div className="h-5 w-1/2 bg-zinc-200" /></div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="border-l-4 border-victoria-red bg-white p-8">
            <p className="font-black text-victoria-dark">No pudimos cargar el inventario en este momento.</p>
            <p className="mt-2 text-sm text-zinc-600">Puedes visitar la vitrina o contactarnos para conocer los vehículos disponibles.</p>
          </div>
        )}

        {!loading && !error && sortedCars.length === 0 && (
          <div className="grid gap-8 bg-victoria-dark px-7 py-10 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:px-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-400">Inventario en actualización</p>
              <h3 className="mt-3 !text-2xl font-black tracking-[-0.03em] sm:!text-3xl">Estamos preparando nuevas opciones.</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Cuéntanos qué vehículo buscas y nuestro equipo te ayuda a encontrarlo.</p>
            </div>
            <Link to="/interes" className="bg-victoria-red px-6 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-white no-underline hover:bg-red-800">Déjanos tu búsqueda</Link>
          </div>
        )}

        {sortedCars.length > 0 && (
          <Swiper
            modules={[Autoplay]}
            spaceBetween={18}
            slidesPerView={1.08}
            autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
          >
            {sortedCars.map((car) => {
              const image = car.images?.[0];
              return (
                <SwiperSlide key={car.id}>
                  <article className="group bg-white">
                    <Link to={`/vitrina/${car.id}`} className="block text-victoria-dark no-underline" aria-label={`Ver ${car.marca} ${car.linea}`}>
                      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-200">
                        {image && !imagesLoaded[car.id] && <div className="absolute inset-0 animate-pulse bg-zinc-200" />}
                        {image ? (
                          <img
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            src={`${imagePath}${car.id}/${image}`}
                            alt={`${car.marca} ${car.linea}, modelo ${car.modelo}`}
                            loading="lazy"
                            onLoad={() => setImagesLoaded((previous) => ({ ...previous, [car.id]: true }))}
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">Imagen próximamente</div>
                        )}
                        {car.featured && <span className="absolute left-0 top-0 bg-victoria-red px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white">Destacado</span>}
                      </div>
                      <div className="border border-t-0 border-zinc-200 p-6">
                        <div className="flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                          <span>Modelo {car.modelo}</span>
                          {car.km != null && <span>{Number(car.km).toLocaleString('es-CO')} km</span>}
                        </div>
                        <h3 className="mt-3 truncate !text-2xl font-black uppercase tracking-[-0.035em]">{car.marca} {car.linea}</h3>
                        <p className="mt-6 border-t border-zinc-200 pt-5 text-xl font-black text-victoria-red">{formatMoney(car.price)}</p>
                      </div>
                    </Link>
                  </article>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
    </section>
  );
}

export default CarCarousel;
