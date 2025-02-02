import React, { Component } from 'react';
import {Breadcrumb, BreadcrumbItem,
        Card, CardBody} from 'reactstrap';
import {Link} from 'react-router-dom';

import CarUploadComponent from '../carUpload/CarUploadComponent';
import axios from 'axios';

function formatMoney(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// const to store the images location path in the server
const imagePath = "/images/vehiculos/";
function RenderVitrinaItem ({car, onClick}) {
  return (
      <Card className='car-card'>
          <Link to={ `/admin/vitrina/${car._id}` } style={{textDecoration:"none",color:"black"}}>

          
              <img
                className='card-img-top-vitrina' 
                src={imagePath + car.uuid + "/" + car.images[0] } 
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



class VitrinaComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      ofertas: []
    }
  }

  componentDidMount() {
    axios.get('/api/admin/cars/')
      .then(response => {
        this.setState({ofertas: response.data});
      }
      ).catch(error => {
        console.log("error catched :",error);
        }
      );
  }

  render() {
    return (
      <React.Fragment>
        <div className="container d-flex flex-column py-2">
          <Breadcrumb>
            <BreadcrumbItem><Link to="/home">Inicio</Link></BreadcrumbItem>
            <BreadcrumbItem active>Vitrina</BreadcrumbItem>
          </Breadcrumb> 
          <div className="col-12">
            <h3>Vitrina</h3>
            <hr />
            {/* button añadir vehiculo which activate a modal that shows the CarUploadComponent */}
            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
              Añadir vehiculo
            </button>
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
            {
            this.state.ofertas.map(car => (
              <div className="col-12 col-md-6 col-lg-4 my-2" key={car._id}>
                <RenderVitrinaItem car={car} />
              </div> 
              ))
            }
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default VitrinaComponent;