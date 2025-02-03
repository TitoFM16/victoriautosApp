import { useState } from 'react';
import { Col, Row, Container } from 'reactstrap';
import PropTypes from 'prop-types';

function FormStep3(props) {
  const [fileNames, setFileNames] = useState({
    frenteImg: props.frenteImg ? props.frenteImg.name : '',
    traseroImg: props.traseroImg ? props.traseroImg.name : '',
    lateralIzqImg: props.lateralIzqImg ? props.lateralIzqImg.name : '',
    lateralDerImg: props.lateralDerImg ? props.lateralDerImg.name : '',
    interiorImg: props.interiorImg ? props.interiorImg.name : '',
    motorImg: props.motorImg ? props.motorImg.name : '',
  });

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const fileName = files.length > 0 ? files[0].name : '';
    setFileNames((prev) => ({
      ...prev,
      [name]: fileName,
    }));
    props.handleChange(e); // Call the parent handler if needed
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
