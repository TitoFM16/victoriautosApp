import { useSelector, useDispatch } from "react-redux";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import TitleBanner from "./TitleBanner";
import { Link } from 'react-router-dom';
import { useState } from 'react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

function formatMoney(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const imagePath = "/images/vehiculos/";

function CarCarousel() {
  const cars = useSelector(state => state.cars.cars);
  const [activeIndex, setActiveIndex] = useState(0);

  // Function to sort cars based on featured status and update date
  const sortCars = (cars) => {
    return [...cars].sort((a, b) => {
      if (a.featured && !b.featured) {
        return -1; // 'a' comes first
      } else if (!a.featured && b.featured) {
        return 1; // 'b' comes first
      } else {
        // Both are either featured or not featured, so sort by update date
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });
  };

  // Sort the cars array
  const sortedCars = sortCars(cars);

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.activeIndex);
  };

  const shouldLoadImage = (index) => {
    // Load visible slides and next slide
    const slidesPerView = window.innerWidth >= 1024 ? 4 
      : window.innerWidth >= 640 ? 2 
      : 1;
    
    return index >= activeIndex && index < activeIndex + slidesPerView + 1;
  };

  return (
    <div className="car-carousel py-2">
      <div className="carousel-header">
        <TitleBanner 
          topText="Ultimos"
          highlightText="Vehículos"
          isBanner={false}
        />
      </div>

      <div className="container">
        <Swiper
          modules={[Autoplay, Navigation]}
          onSlideChange={handleSlideChange}
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
          {sortedCars.map((car, index) => (
            <SwiperSlide key={car._id}>
              <div className="px-2 py-2">
                <div className="card car-card">
                  <Link to={`/vitrina/${car._id}`} style={{textDecoration:"none", color:"black"}} aria-hidden="false">
                    {shouldLoadImage(index) ? (
                      <img 
                        className="card-img-top-vitrina"
                        src={imagePath + car.uuid + "/" + car.images[0]}
                        alt={'vehiculo' + car.name}
                        loading="lazy"
                      />
                    ) : (
                      <div 
                        className="card-img-top-vitrina"
                        style={{ 
                          backgroundColor: '#f0f0f0',
                          aspectRatio: '16/9'
                        }} 
                      />
                    )}
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
          <button 
            type="button" 
            className="btn submit-button"
            onClick={() => window.location.href = "/vitrina"}
            style={{color: "white"}}
          >
            Ver Más
          </button>
        </div>
      </div>
    </div>
  );
}

export default CarCarousel;
