import React, { useEffect } from 'react';
import {Breadcrumb, BreadcrumbItem,
        Card, CardBody} from 'reactstrap';
import {Link} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOfertas } from '../../../redux/actions/ofertasActions';
import PropTypes from 'prop-types';

import CarUploadComponent from '../carUpload/CarUploadComponent';


function formatMoney(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// const to store the images location path in the server
const imagePath = "/images/ofertas/";
function RenderVitrinaItem ({car}) {
  return (
      <Card className='car-card'>
          <Link to={ `/admin/ofertas/${car.id}` } style={{textDecoration:"none",color:"black"}}>


              <img
                className='card-img-top-vitrina'
                src={imagePath + car.id +  "/" + car.images[0] }
                alt={car.marca} />
              
              <CardBody>
                <h3 >${formatMoney(car.price)}</h3>
                <div>
                <h5 className='card-properties-text'>{car.marca} - {car.linea}</h5>
                </div>
                <h5 className='card-properties-text'>{car.modelo}</h5>
              </CardBody>

          </Link>
      </Card>
  );
}

RenderVitrinaItem.propTypes = {
  car: PropTypes.shape({
    id: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    marca: PropTypes.string.isRequired,
    linea: PropTypes.string.isRequired,
    modelo: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired
  }).isRequired
};

const OfertasComponent = () => {
  const dispatch = useDispatch();
  const ofertas = useSelector(state => state.ofertas.ofertas);
  
  useEffect(() => {
    dispatch(fetchOfertas());
  }, [dispatch]);

  return (
    <React.Fragment>
      <div className="container d-flex flex-column py-2">
        <Breadcrumb>
          <BreadcrumbItem><Link to="/home">Inicio</Link></BreadcrumbItem>
          <BreadcrumbItem active>Ofertados</BreadcrumbItem>
        </Breadcrumb> 
        <div className="col-12">
          <h3>Ofertados</h3>
          <hr />

          {/* Modal */}
          <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">Añadir vehiculo</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  
                </div>
                <div className="modal-body">
                  <CarUploadComponent/>
                </div>

              </div>
            </div>
          </div>


        </div>   
                          
        <div className="row">
          {ofertas.map(car => (
            <div className="col-12 col-md-6 col-lg-4 my-2" key={car.id}>
              <RenderVitrinaItem car={car} />
            </div> 
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default OfertasComponent;