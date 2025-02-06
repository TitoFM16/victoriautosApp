import { useState } from 'react';
import { Col, Row, Container } from 'reactstrap';
import PropTypes from 'prop-types';

// Constants for image resizing
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const QUALITY = 0.8; // 80% quality for JPEG compression

const resizeImage = (file) => {
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
      
      // Check if the original file is already WebP
      const isWebP = file.type === 'image/webp';
      const outputType = isWebP ? 'image/webp' : 'image/webp';
      const outputExt = isWebP ? 'webp' : 'webp';
      
      // Convert to WebP with quality setting
      canvas.toBlob((blob) => {
        // Create new filename with webp extension
        const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
        const newFileName = `${originalName}.${outputExt}`;
        
        const resizedFile = new File([blob], newFileName, {
          type: outputType,
          lastModified: Date.now(),
        });
        resolve(resizedFile);
      }, outputType, QUALITY);
    };
    
    img.onerror = reject;
  });
};

function FormStep3(props) {
  const [fileNames, setFileNames] = useState({
    frenteImg: props.frenteImg ? props.frenteImg.name : '',
    traseroImg: props.traseroImg ? props.traseroImg.name : '',
    lateralIzqImg: props.lateralIzqImg ? props.lateralIzqImg.name : '',
    lateralDerImg: props.lateralDerImg ? props.lateralDerImg.name : '',
    interiorImg: props.interiorImg ? props.interiorImg.name : '',
    motorImg: props.motorImg ? props.motorImg.name : '',
  });

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files.length === 0) return;

    try {
      // Resize image before setting it
      const resizedFile = await resizeImage(files[0]);
      
      // Create a new event with the resized file
      const newEvent = {
        target: {
          name,
          type: 'file',
          files: [resizedFile]
        }
      };

      setFileNames((prev) => ({
        ...prev,
        [name]: files[0].name,
      }));

      props.handleChange(newEvent);
    } catch (error) {
      console.error('Error resizing image:', error);
      alert('Error al procesar la imagen. Por favor, intente con otra.');
    }
  };

  return (
    <Container className="vende-form-container py-2 mb-2 border-in-container shadow">
      <Row className="justify-content-center">
        <Col md={6} sm={12} className="form-box-spacer">
          <div className="form-group">
            <div className="container py-3">
              <label className="left-photo-position" htmlFor="frenteImg">Frente</label>
              <div className="input-group custom-file-button">
                <label className="input-group-text custom-file-button" htmlFor="frenteImg">Buscar</label>
                <input
                  type="file"
                  className="form-control d-none"
                  id="frenteImg"
                  name="frenteImg"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <input
                  type="text"
                  className="form-control"
                  value={fileNames.frenteImg || 'No file selected'}
                  readOnly
                />
              </div>
            </div>
          </div>
        </Col>
        <Col md={6} sm={12} className="form-box-spacer">
          <div className="form-group">
            <div className="container py-3">
              <label className="left-photo-position" htmlFor="traseroImg">Trasera</label>
              <div className="input-group custom-file-button">
                <label className="input-group-text custom-file-button" htmlFor="traseroImg">Buscar</label>
                <input
                  type="file"
                  className="form-control d-none"
                  id="traseroImg"
                  name="traseroImg"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <input
                  type="text"
                  className="form-control"
                  value={fileNames.traseroImg || 'No file selected'}
                  readOnly
                />
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Row className="align-items-center justify-content-center">
        <Col md={6} sm={12} className="form-box-spacer">
          <div className="form-group">
            <div className="container py-3">
              <label className="left-photo-position" htmlFor="lateralIzqImg">Lateral izquierda</label>
              <div className="input-group custom-file-button">
                <label className="input-group-text custom-file-button" htmlFor="lateralIzqImg">Buscar</label>
                <input
                  type="file"
                  className="form-control d-none"
                  id="lateralIzqImg"
                  name="lateralIzqImg"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <input
                  type="text"
                  className="form-control"
                  value={fileNames.lateralIzqImg || 'No file selected'}
                  readOnly
                />
              </div>
            </div>
          </div>
        </Col>
        <Col md={6} sm={12} className="form-box-spacer">
          <div className="form-group">
            <div className="container py-3">
              <label className="left-photo-position" htmlFor="lateralDerImg">Lateral Derecha</label>
              <div className="input-group custom-file-button">
                <label className="input-group-text custom-file-button" htmlFor="lateralDerImg">Buscar</label>
                <input
                  type="file"
                  className="form-control d-none"
                  id="lateralDerImg"
                  name="lateralDerImg"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <input
                  type="text"
                  className="form-control"
                  value={fileNames.lateralDerImg || 'No file selected'}
                  readOnly
                />
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Row className="align-items-center justify-content-center">
        <Col md={6} sm={12} className="form-box-spacer">
          <div className="form-group">
            <div className="container py-3">
              <label className="left-photo-position" htmlFor="interiorImg">Interior</label>
              <div className="input-group custom-file-button">
                <label className="input-group-text custom-file-button" htmlFor="interiorImg">Buscar</label>
                <input
                  type="file"
                  className="form-control d-none"
                  id="interiorImg"
                  name="interiorImg"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <input
                  type="text"
                  className="form-control"
                  value={fileNames.interiorImg || 'No file selected'}
                  readOnly
                />
              </div>
            </div>
          </div>
        </Col>
        <Col md={6} sm={12} className="form-box-spacer">
          <div className="form-group">
            <div className="container py-3">
              <label className="left-photo-position" htmlFor="motorImg">Motor</label>
              <div className="input-group custom-file-button">
                <label className="input-group-text custom-file-button" htmlFor="motorImg">Buscar</label>
                <input
                  type="file"
                  className="form-control d-none"
                  id="motorImg"
                  name="motorImg"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <input
                  type="text"
                  className="form-control"
                  value={fileNames.motorImg || 'No file selected'}
                  readOnly
                />
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

FormStep3.propTypes = {
  frenteImg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  traseroImg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  lateralIzqImg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  lateralDerImg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  interiorImg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  motorImg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  handleChange: PropTypes.func.isRequired
};

export default FormStep3;
