import { useLocation } from 'react-router';

import WhatsappIcon from '../assets/icons/whatsapp-brands-solid.svg';
import FacebookIcon from '../assets/icons/facebook-f-brands-solid.svg';
import InstagramIcon from '../assets/icons/instagram-brands-solid.svg';
import logo from '../assets/images/logo_.webp';

//will render in any location except /admin
function Footer() {
    // logic to render footer
    const location = useLocation();

    if (location.pathname.includes('/admin')) {
        return null;
    }
    
    return(

        <div className="footer " style={{backgroundColor: "#B30000FA",
                                        color:"white",
                                        // little border radius in top corners
                                        
                                        }} >


        <div className="container-fluid text-center text-md-left" style={{"width":"90%"}}>
    
           
            <div className="row ">
    
               
                <div className="col-md-4 my-3 py-3" style={{textAlign:"center"}}>
    
                    <span>

                    
                    <img src = {logo}
                    width="120" 
                    height="120"
                    align="center"
                    alt='logo'
                    />
                    
                    </span>
                    <p className="footer-title">síguenos en redes</p>
                    <div style={{"align":"center"}}>
                      <a className='px-2' href="https://www.facebook.com" aria-label="Facebook">
                        <img  src={FacebookIcon} width="45" height="45" alt="Facebook" />
                      </a>
                      <a className='px-2' href="https://www.instagram.com" aria-label="Instagram">
                        <img  src={InstagramIcon} width="45" height="45" alt="Instagram" />   
                      </a>
                      <a className='px-2' href="https://wa.me/573155806571" aria-label="WhatsApp">
                        <img  src={WhatsappIcon} width="45" height="45" alt="WhatsApp" />
                      </a>                      
                    </div>
                </div>
              
    
                
    
              
                <div className="col-md-4 mb-md-0 mb-3">
                    <br/>
                   
                    <p className="footer-title" >Nuestra sala de ventas</p>
                    <p>
                      
                      <b>San Juan de Pasto, Nariño</b>
                      <br/>
                      AV Panamericana Calle 16 # 35 - 69
                      <br/> 
                      <br/>
                      <b> Horario de atención</b>
                      <br/>
                      Lunes a viernes: 8:00 am a 6:00 pm
                      Sabados y festivos: 8:00 am a 4:00 pm 
                    </p>
    
                </div>
        
                <div className="col-md-4 mb-md-0 mb-3" style={{ textDecoration: "none",
                                                                color: "inherit"}}>
                    <br/>
              
                    <p className="footer-title">Servicios</p>
                    <ul className="list-unstyled">
                        <li>
                            <a href="/vende"                         
                            title="Vende tu vehículo"
                            aria-label="Vende tu vehículo"
                              style={{ textDecoration: "none",
                                                      color: "inherit"
                                                      }}>Vende tu vehículo</a>
                        </li>
                        <li>
                            <a href="/vitrina" 
                            title="Vitrina de vehículos"
                            aria-label="Vitrina de vehículos"
                            style={{ textDecoration: "none",
                                                      color: "inherit"}}>Vitrina de vehículos</a>
                        </li>
                        <li>
                            <a href="/financiamiento" 
                            title="Financia tu vehículo"
                            aria-label="Financia tu vehículo"
                            style={{ textDecoration: "none",
                                                      color: "inherit"}}>Financia Tu vehículo</a>
                        </li>
                        <li>
                            <a href="/nosotros" 
                            title="Contacto"
                            aria-label="Contacto"
                            style={{ textDecoration: "none",
                                                      color: "inherit"}}>Contacto </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
        
        
   
    
    )
}

export default Footer;