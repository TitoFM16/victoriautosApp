import { useSelector, useDispatch } from "react-redux";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import HeroBanner from "./HeroBanner";
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchCars } from '../../redux/actions/carsActions';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

function formatMoney(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const imagePath = "/images/vehiculos/";

function CarCarousel() {
  const cars = useSelector(state => state.cars.cars);


  return (
    <div className="car-carousel py-2">
      <div className="carousel-header">
        <HeroBanner 
          topText="Ultimos"
          highlightText="Vehículos"
          isBanner={false}
        />
      </div>

      <div className="container">
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={20}
          navigation={{
            enabled: false,
            hideOnClick: false,
            prevEl: null,
            nextEl: null
          }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 10
            },
            480: {
              slidesPerView: 1,
              spaceBetween: 15
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 15
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 20
            }
          }}
          className="w-100"
        >
          {cars.map((car) => (
            <SwiperSlide key={car._id}>
              <div className="px-2 py-2">
                <div className="card car-card">
                  <Link to={`/vitrina/${car._id}`} style={{textDecoration:"none", color:"black"}} aria-hidden="false">
                    <img 
                      className="card-img-top-vitrina"
                      src={imagePath + car.uuid + "/" + car.images[0]}
                      alt={'vehiculo' + car.name}
                    />
                    <div className="card-body">
                      <p className="car-price">${formatMoney(car.price)}</p>
                      <p className="card-properties-text">{car.marca} - {car.linea}</p>
                      <p className="card-properties-text">{car.modelo}</p>
                    </div>
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="container d-flex justify-content-center py-4" role="group" aria-label="Basic example">
          <button type="button" className="btn submit-button">
            <Link to="/vitrina" style={{textDecoration:"none",color:"white"}}>Ver Más</Link>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CarCarousel;
