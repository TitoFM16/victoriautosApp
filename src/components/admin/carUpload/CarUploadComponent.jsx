import React from 'react';  
import {Breadcrumb, BreadcrumbItem} from 'reactstrap';
import {Link} from 'react-router-dom';
import axios from 'axios';

import LoadingModal from '../../shared/LoadingModal';

// Add these constants at the top of the file
const MAX_WIDTH = 1080;
const MAX_HEIGHT = 1350;
const QUALITY = 0.8;

class CarUploadComponent extends React.Component {
    constructor(props) {
      super(props)
      
      // bind the functions handlers to the constructor to make them available
      this.handleSubmit = this.handleSubmit.bind(this);

      this.state = {
        Tipo: '',
        marca: '',
        linea: '',
        modelo: 0,
        km: 0,  
        price: 0,
        matricula: '',
        color : '',
        transmision: '',
        combustible: '',
        cilindraje: '',
        traccion: '',
        direccion: '',
        frenos: '',
        airbag: '',
        placa: '',
        vin: '',
        chasis_no: '',
        motor_no: '',
        importacion_no: '',
        importacion_date: '',
        status: 'PENDING',
        consignacion: false,
        featured: false,

        frenteImg: '',
        traseroImg: '',
        lateralIzqImg: '',
        lateralDerImg: '',
        interiorImg: '',
        motorImg: '',
          
        marcaDropdown: [],
        lineaDropdown: [],
        customMarca: '',
        customLinea: '',
        showLoadingModal: false,
        submitStatus: 'loading'
      }
    }
  
    resizeImage = (file) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        
        img.onload = () => {
          // Calculate new dimensions maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
          
          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to WebP
          canvas.toBlob((blob) => {
            const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
            const newFileName = `${originalName}.webp`;
            
            const resizedFile = new File([blob], newFileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          }, 'image/webp', QUALITY);
        };
        
        img.onerror = reject;
      });
    };

    ensureVehicleDataExists = async (tipo, marca, linea) => {
      try {
        // Determine the actual marca and linea values to use
        const actualMarca = marca === '__ADD_NEW__' ? this.state.customMarca : marca;
        const actualLinea = linea === '__ADD_NEW__' ? this.state.customLinea : linea;

        // Validate that we have actual values
        if (!actualMarca || !actualLinea) {
          throw new Error('Por favor complete la marca y linea');
        }

        // Check if marca exists for this tipo, if not create it
        const marcaExists = this.state.marcaDropdown.some(m => m.marca === actualMarca);
        if (!marcaExists && actualMarca) {
          await axios.post('/api/buscavehiculo/marca', {
            tipo: tipo,
            marca: actualMarca
          }, {
            withCredentials: true
          });
        }

        // Check if linea exists for this marca and tipo, if not create it
        const lineaExists = this.state.lineaDropdown.some(l => 
          (l.linea + (l.version ? ' ' + l.version : '')) === actualLinea
        );
        if (!lineaExists && actualLinea && actualMarca) {
          // Split linea into linea and version if it contains spaces
          const lineaParts = actualLinea.trim().split(' ');
          const lineaName = lineaParts[0];
          const version = lineaParts.length > 1 ? lineaParts.slice(1).join(' ') : '';

          await axios.post('/api/buscavehiculo/linea', {
            tipo: tipo,
            marca: actualMarca,
            linea: lineaName,
            version: version
          }, {
            withCredentials: true
          });
        }

        // Return the actual values to be used in form submission
        return { actualMarca, actualLinea };
      } catch (error) {
        console.error('Error ensuring vehicle data exists:', error);
        throw error;
      }
    };

    handleChange = async (event) => {
      const {name, type, value} = event.target;

      if (type === 'checkbox') {
        return this.setState({
          [name]: event.target.checked
        });
      }

      if (type === 'file') {
        try {
          const resizedFile = await this.resizeImage(event.target.files[0]);
          return this.setState({
            [name]: resizedFile
          });
        } catch (error) {
          console.error('Error resizing image:', error);
          alert('Error al procesar la imagen. Por favor, intente con otra.');
          return;
        }
      }

      if (name === 'Tipo') {
        this.setState({
          [name]: value,
          marca: '', // Reset marca when Tipo changes
          linea: '', // Reset linea when Tipo changes
          customMarca: '',
          customLinea: '',
        });

        // Fetch marca options based on selected Tipo
        if (value) {
          axios.get('/api/buscavehiculo/?tipo=' + value)
            .then((response) => {
              this.setState({ marcaDropdown: response.data });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      } else if (name === 'marca') {
        this.setState({
          [name]: value,
          linea: '', // Reset linea when marca changes
          customLinea: '',
        });

        // Fetch linea options based on selected Tipo and marca
        if (value && value !== '__ADD_NEW__' && this.state.Tipo) {
          axios.get('/api/buscavehiculo/?tipo=' + this.state.Tipo + '&marca=' + value)
            .then((response) => {
              this.setState({ lineaDropdown: response.data });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      } else if (name === 'linea') {
        this.setState({
          [name]: value,
        });
      } else if (name === 'customMarca') {
        this.setState({
          [name]: value,
        });
      } else if (name === 'customLinea') {
        this.setState({
          [name]: value,
        });
      } else {
        // Handle all other inputs normally
        this.setState({
          [name]: value
        });
      }    
    }
     

    
    handleSubmit = event => {
      event.preventDefault();

  
      // Get state data
      const {
        Tipo,
        marca,
        linea,
        modelo,
        km,
        price,
        matricula,
        color,
        transmision,
        combustible,
        cilindraje,
        traccion,
        direccion,
        frenos,
        airbag,
        placa,
        vin,
        chasis_no,
        motor_no,
        importacion_no,
        importacion_date,
        status,
        featured,
        consignacion,
        
        frenteImg,
        traseroImg,
        lateralIzqImg,
        lateralDerImg,
        interiorImg,
        motorImg,

          } = this.state;
      
          
      //function to get extension of files
      function getExtension(file){
        return file.type.match("(image[/]{1})(.*)")[2]
      }

      // create images array to upload to the server in the mongoose model carImages array value
      const images = [frenteImg,traseroImg,lateralIzqImg,lateralDerImg,interiorImg,motorImg]

      // We'll update DIR after getting actual marca and linea values
      
      const formValues={
        DIR: "", // Will be updated later
        Tipo: Tipo,
        marca: marca,
        linea: linea,
        modelo: modelo,
        km: km,
        price: price,
        matricula: matricula,
        color: color,
        transmision: transmision,
        combustible: combustible,
        cilindraje: cilindraje,
        traccion: traccion,
        direccion: direccion,
        frenos: frenos,
        airbag: airbag,
        placa: placa,
        vin: vin,
        chasis_no: chasis_no,
        motor_no: motor_no,
        importacion_no: importacion_no,
        importacion_date: importacion_date,
        status: status,
        featured: featured,
        consignacion: consignacion
      }

      
      // Create an object of formData
      const formData = new FormData();

      //Entry formValues in FormDAta
      Object.entries(formValues).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Images will be processed after ensuring vehicle data exists

      this.setState({ showLoadingModal: true, submitStatus: 'loading' });

      // First, ensure marca and linea exist in the database
      this.ensureVehicleDataExists(Tipo, marca, linea)
        .then((result) => {
          // Calculate DIR with actual values
          const actualDIR = result.actualMarca + "_" + result.actualLinea + "_" + modelo + "/";
          
          // Update formData with actual marca, linea, and DIR values
          formData.set('marca', result.actualMarca);
          formData.set('linea', result.actualLinea);
          formData.set('DIR', actualDIR);
          
          // Create images array and add to formData with updated DIR
          const images = [frenteImg, traseroImg, lateralIzqImg, lateralDerImg, interiorImg, motorImg];
          images.forEach((image, index) => {
            formData.append("carImages", image, actualDIR + index + "." + getExtension(image));
          });
          
          // Then create the car
          return axios.post('/api/admin/cars/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/json'
            },
            withCredentials: true
          });
        })
        .then(() => {
          this.setState({ submitStatus: 'success' });
        })
        .catch((error) => {
          console.error('Error uploading car:', error.response || error.message);
          this.setState({ submitStatus: 'error' });
        });
    }

    render() {    
      return (
        <React.Fragment>
          <form onSubmit={this.handleSubmit}  encType="multipart/form-data">
            <div className="container">
              <div className="row">
                <Breadcrumb>
                  <BreadcrumbItem><Link to="/admin">Admin</Link></BreadcrumbItem>
                  <BreadcrumbItem active>Car Upload</BreadcrumbItem>
                </Breadcrumb>
              </div>
              <div className="row">
                <div className="col-6">
                  <h3>Información General</h3>
                  <div className="form-group">
                    <label htmlFor="Tipo">Tipo</label>
                    <select className="form-control" id="Tipo" name="Tipo"                             
                            value={this.state.Tipo}
                            onChange={this.handleChange}>
                      <option value="">Tipo de vehiculo</option>
                      <option value="AUT">Automovil</option>
                      <option value="CAM">Camioneta</option>
                      <option value="CAMP">Campero</option>
                      <option value="HE">Hibrido</option>
                      <option value="HC">Hibrido de Combustión</option>
                      <option value="HL">Hibrido Ligero</option>
                      <option value="MOTO">Moto</option>
                      <option value="PU">PickUp</option>
                      <option value="SUV">Suv</option>
                      <option value="UTIL">Utilitario</option>
                      <option value="VAN">Van</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="marca">Marca</label>
                    <select className="form-control" id="marca" name="marca" 
                            value={this.state.marca}
                            onChange={this.handleChange}>
                      <option value="">Seleccione marca</option>
                      {this.state.Tipo !== '' && this.state.marcaDropdown
                        .sort((a, b) => a.marca.localeCompare(b.marca))
                        .map((marca) => (
                          <option key={marca.id || marca.marca} value={marca.marca}>{marca.marca}</option>
                        ))
                      }
                      {this.state.Tipo !== '' && (
                        <option value="__ADD_NEW__">+ Agregar nueva marca...</option>
                      )}
                    </select>
                    {this.state.marca === '__ADD_NEW__' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Escriba la nueva marca"
                          name="customMarca"
                          value={this.state.customMarca || ''}
                          onChange={this.handleChange}
                        />
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="linea">Linea</label>
                    <select
                        className="form-control"
                        id="linea"
                        name="linea"
                        value={this.state.linea}
                        onChange={this.handleChange}
                    >
                        <option value="">Seleccione linea</option>
                        {this.state.marca !== '' && this.state.marca !== '__ADD_NEW__' &&
                            this.state.lineaDropdown
                                .sort((a, b) =>
                                    (a.linea + ' ' + (a.version || '')).localeCompare(
                                        b.linea + ' ' + (b.version || '')
                                    )
                                )
                                .map((linea) => (
                                    <option
                                        key={linea.linea + (linea.version || '')}
                                        value={linea.linea + (linea.version ? ' ' + linea.version : '')}
                                    >
                                        {linea.linea + (linea.version ? ' ' + linea.version : '')}
                                    </option>
                                ))}
                        {this.state.marca !== '' && this.state.marca !== '__ADD_NEW__' && (
                          <option value="__ADD_NEW__">+ Agregar nueva linea...</option>
                        )}
                    </select>
                    {this.state.linea === '__ADD_NEW__' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Escriba la nueva linea"
                          name="customLinea"
                          value={this.state.customLinea || ''}
                          onChange={this.handleChange}
                        />
                      </div>
                    )}
                </div>

                  <div className="form-group">
                    <label htmlFor="modelo">Modelo</label>
                    <input type="text" className="form-control" id="modelo" name="modelo" 
                                                value={this.state.modelo}
                                                onChange={this.handleChange}/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="km">Kilometraje</label>
                    <input type="text" className="form-control" id="km" name="km" 
                                                value={this.state.km}
                                                onChange={this.handleChange}/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="price">Precio</label>
                    <input type="text" className="form-control" id="price" name="price" 
                                                value={this.state.price}
                                                onChange={this.handleChange}/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="matricula">Matricula</label>
                    <input type="text" className="form-control" id="matricula" name="matricula" 
                                                value={this.state.matricula}
                                                onChange={this.handleChange}/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="color">Color</label>
                    <input type="text" className="form-control" id="color" name="color" 
                                                value={this.state.color}
                                                onChange={this.handleChange}/>
                  </div>
                </div>
                <div className="col-6">
                  <h3>Información	 tecnica</h3>
                  <div className="form-group">
                   <label htmlFor="transmision">Transmisión</label>
                    <select className="form-control" id="transmision" name="transmision" 
                                                value={this.state.transmision}
                                                onChange={this.handleChange}>
                      <option value="0">Seleccione</option>
                      <option value="Manual">Manual</option>
                      <option value="Automática">Automática</option>
                      <option value="Secuencial">Secuencial</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="combustible">Combustible</label>
                    <select className="form-control" id="combustible" name="combustible" 
                                                value={this.state.combustible}
                                                onChange={this.handleChange}>
                      <option value="0">Seleccione</option>
                      <option value="Gasolina">Gasolina</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Híbrido">Híbrido</option>
                      <option value="Eléctrico">Eléctrico</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="cilindraje">Cilindraje</label>
                    <input type="text" className="form-control" id="cilindraje" name="cilindraje" 
                                                value={this.state.cilindraje}
                                                onChange={this.handleChange}/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="traccion">Tracción</label>
                    <select className="form-control" id="traccion" name="traccion" 
                                                value={this.state.traccion}
                                                onChange={this.handleChange}>
                      <option value="0">Seleccione</option>
                      <option value="Delantera">Delantera</option>
                      <option value="Trasera">Trasera</option>
                      <option value="4x4">4x4</option>
                      <option value="AWD">AWD</option>
                    </select> 
                  </div>
                  <div className="form-group">
                    <label htmlFor='direccion'>Dirección</label>
                    <select className="form-control" id="direccion" name="direccion" 
                                                value={this.state.direccion}
                                                onChange={this.handleChange}>
                      <option value="0">Seleccione</option>
                      <option value="Mecánica">Mecánica</option>
                      <option value="Hidráulica">Hidráulica</option>
                      <option value="Eléctrica">Eléctrica</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="vin">VIN</label>
                    <input type="text" className="form-control" id="vin" name="vin" 
                                                value={this.state.vin}
                                                onChange={this.handleChange}/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="chasis_no">No. Chasis</label>
                    <input type="text" className="form-control" id="chasis_no" name="chasis_no" 
                                                value={this.state.chasis_no}
                                                onChange={this.handleChange}/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="motor_no">No. Motor</label>
                    <input type="text" className="form-control" id="motor_no" name="motor_no" 
                                                value={this.state.motor_no}
                                                onChange={this.handleChange}/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="importacion_no">No. Importación</label>
                    <input type="text" className="form-control" id="importacion_no" name="importacion_no" 
                                                value={this.state.importacion_no}
                                                onChange={this.handleChange}/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="importacion_date">Fecha Importación</label>
                    <input type="date" className="form-control" id="importacion_date" name="importacion_date" 
                                                value={this.state.importacion_date}
                                                onChange={this.handleChange}/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="frenos">Frenos</label>
                    <select className="form-control" id="frenos" name="frenos" 
                                                value={this.state.frenos}
                                                onChange={this.handleChange}>
                      <option value="0">Seleccione</option>
                      <option value="ABS">ABS</option>
                      <option value="Disco">Discos</option>
                      <option value="Tambor">Tambor</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="airbag">Airbag</label>
                    <select className="form-control" id="airbag" name="airbag" 
                                                value={this.state.airbag}
                                                onChange={this.handleChange}>
                      <option value="0">Seleccione</option>
                      <option value="Si">Si</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="placa">placa</label>
                    <input type="text" className="form-control" id="placa" name="placa" 
                                                value={this.state.placa}
                                                onChange={this.handleChange}/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Estado</label>
                    <select className="form-control" id="status" name="status" 
                                                value={this.state.status}
                                                onChange={this.handleChange}>
                      <option value="0">Seleccione</option>
                      <option value="PENDING">Pendiente</option>
                      <option value="ALMACEN">Almacen</option>
                      <option value="VENDIDO">Vendido</option>
                    </select>
                  </div>
                  {/* SWITCH BUTTON TO SELECT IF featured OR NOT */}
                  <div className="form-group d-flex align-items-center">
                    <div className="form-check me-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="featured" 
                        name="featured" 
                        value={this.state.featured}
                        onChange={this.handleChange}
                      />
                      <label className="form-check-label" htmlFor="featured">
                        Destacado
                      </label>
                    </div>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="consignacion" 
                        name="consignacion" 
                        value={this.state.consignacion}
                        onChange={this.handleChange}
                      />
                      <label className="form-check-label" htmlFor="consignacion">
                        Consignación
                      </label>
                    </div>
                  </div>


                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <h3>Imagenes</h3>

                  <div className="input-group align-self-start d-flex">
                  
                    <div className="form-group">
                      <div className="container py-3">
                        <label  htmlFor="frenteImg">Foto Frente</label>
                            <div className="input-group custom-file-button">
                                <label className="input-group-text" htmlFor="frenteImg">Buscar</label>
                                <input 
                                        type="file" 
                                        className="form-control" 
                                        id="frenteImg"
                                        name="frenteImg"
                                        //value={props.interior}
                                        onChange={this.handleChange}
                                        />                        
                            </div>
                      </div>
                    </div>
                  </div>
                  <div className="input-group align-self-start d-flex">
                    <div className="form-group">
                      <div className="container py-3">
                        <label  htmlFor="traseroImg">Foto Trasera</label>
                            <div className="input-group custom-file-button">
                                <label className="input-group-text" htmlFor="traseroImg">Buscar</label>
                                <input 
                                        type="file" 
                                        className="form-control" 
                                        id="traseroImg"
                                        name="traseroImg"
                                        //value={props.interior}
                                        onChange={this.handleChange}
                                        />                        
                            </div>
                      </div>
                    </div>
                  </div>
                  <div className="input-group align-self-start d-flex">
                    <div className="form-group">
                      <div className="container py-3">
                        <label  htmlFor="lateralDerImg">Foto Lateral Derecha</label>
                            <div className="input-group custom-file-button">
                                <label className="input-group-text" htmlFor="lateralDerImg">Buscar</label>
                                <input 
                                        type="file" 
                                        className="form-control" 
                                        id="lateralDerImg"
                                        name="lateralDerImg"
                                        onChange={this.handleChange}
                                        />                        
                            </div>
                      </div>
                    </div>
                  </div>
                  <div className="input-group align-self-start d-flex">
                    <div className="form-group">
                      <div className="container py-3">
                        <label  htmlFor="lateralIzqImg">Foto Lateral Izquierda</label>
                            <div className="input-group custom-file-button">
                                <label className="input-group-text" htmlFor="lateralIzqImg">Buscar</label>
                                <input 
                                        type="file" 
                                        className="form-control" 
                                        id="lateralIzqImg"
                                        name="lateralIzqImg"
                                        //value={props.interior}
                                        onChange={this.handleChange}
                                        />                        
                            </div>
                      </div>
                    </div>
                  </div>
                  <div className="input-group align-self-start d-flex">
                    <div className="form-group">
                      <div className="container py-3">
                        <label  htmlFor="interiorImg">Foto Interior</label>
                            <div className="input-group custom-file-button">
                                <label className="input-group-text" htmlFor="interiorImg">Buscar</label>
                                <input 
                                        type="file" 
                                        className="form-control" 
                                        id="interiorImg"
                                        name="interiorImg"
                                        //value={props.interior}
                                        onChange={this.handleChange}
                                        />                        
                            </div>
                      </div>
                    </div>
                  </div>
                  <div className="input-group align-self-start d-flex">
                    <div className="form-group">
                      <div className="container py-3">
                        <label  htmlFor="motorImg">Foto Motor</label>
                            <div className="input-group custom-file-button">
                                <label className="input-group-text" htmlFor="motorImg">Buscar</label>
                                <input 
                                        type="file" 
                                        className="form-control" 
                                        id="motorImg"
                                        name="motorImg"
                                        //value={props.interior}
                                        onChange={this.handleChange}
                                        />                        
                            </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <hr></hr>
                  <button type="submit" className="btn btn-primary" onClick={this.handleSubmit}>Guardar</button>
                  <button type="button" className="btn btn-danger" >Cancelar</button>
                </div>
              </div>
            </div>
          </form>
          <LoadingModal 
            show={this.state.showLoadingModal}
            status={this.state.submitStatus}
            onClose={() => {
              this.setState({ showLoadingModal: false });
              if (this.state.submitStatus === 'success') {
                window.location.reload();
              }
            }}
          />
        </React.Fragment>
        );
    }
}

CarUploadComponent.propTypes = {
  // Add any necessary prop types here
};

export default CarUploadComponent;