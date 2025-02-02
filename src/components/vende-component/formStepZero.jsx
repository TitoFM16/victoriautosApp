import React from 'react';


const info = <span className="material-symbols-outlined icon-style" >info</span>
const car = <span className="material-symbols-outlined icon-style" >directions_car</span>
const camera = <span className="material-symbols-outlined icon-style" >photo_camera</span>

const FormStep0 = (props) =>{
    return(
        <div className='container-fluid py-2 px-0 mx-0'>
            <div className='row'>
                <div className='col-4'>
                    {info}
                    <h4 className='h4-subtitles'>Ingresa tus datos</h4>
                </div>
                <div className='col-4'>
                    {car}
                    <h4 className='h4-subtitles'>Ingresa los datos del Vehículo</h4> 
                </div>
                <div className='col-4'>
                    {camera}
                    <h4 className='h4-subtitles'>Sube fotos del Vehículo</h4>
                </div>
            </div>
        </div>
    );
}

export default FormStep0;