import { Link } from 'react-router-dom';
import { WHATSAPP_DISPLAY, whatsappUrl } from '../services/whatsapp';

const LAST_UPDATED = '5 de octubre de 2026';
const COMPANY = 'Victoriautos Consignataria S.A.S.';
const contactHref = whatsappUrl('Hola Victoriautos, quiero hacer una consulta sobre mis datos personales.');

// Política de Tratamiento de Datos Personales conforme a la Ley Estatutaria
// 1581 de 2012 y al Decreto Único Reglamentario 1074 de 2015 (Capítulos 25 y 26,
// que compilan los Decretos 1377 de 2013 y 886 de 2014).
const PrivacyPolicyPage = () => (
  <div className="vf-page vp-policy">
    <nav aria-label="breadcrumb" className="vf-crumbs">
      <Link to="/">Inicio</Link>
      <span aria-hidden="true">/</span>
      <span>Políticas de privacidad</span>
    </nav>
    <h1 className="vf-title">Política de tratamiento de datos personales</h1>
    <p className="vf-sub">Última actualización: {LAST_UPDATED}</p>

    <div className="vf-card">
      <p>
        En {COMPANY} respetamos tu privacidad. Esta política explica qué datos personales recolectamos, para qué
        los usamos, con quién los compartimos y cómo puedes ejercer tus derechos como titular, en cumplimiento de
        la Ley Estatutaria 1581 de 2012 y del Decreto 1074 de 2015.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li><strong>Razón social:</strong> {COMPANY}</li>
        <li><strong>NIT:</strong> 901.050.942-5</li>
        <li><strong>Domicilio y dirección:</strong> Calle 16 #35-69, Avenida Panamericana, San Juan de Pasto, Nariño, Colombia.</li>
        <li>
          <strong>Canal de atención:</strong> WhatsApp{' '}
          <a href={contactHref} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}</a>{' '}
          y atención presencial en nuestra sala de ventas, de lunes a viernes de 8:00 a.m. a 6:00 p.m. y sábados y
          festivos de 8:00 a.m. a 4:00 p.m.
        </li>
      </ul>
      <p>
        La gerencia de {COMPANY} es el área encargada de atender las consultas y reclamos relacionados con el
        tratamiento de datos personales.
      </p>

      <h2>2. Definiciones</h2>
      <ul>
        <li><strong>Dato personal:</strong> cualquier información vinculada o que pueda asociarse a una persona natural determinada o determinable.</li>
        <li><strong>Titular:</strong> la persona natural cuyos datos personales son objeto de tratamiento.</li>
        <li><strong>Tratamiento:</strong> cualquier operación sobre datos personales, como la recolección, almacenamiento, uso, circulación o supresión.</li>
        <li><strong>Autorización:</strong> el consentimiento previo, expreso e informado del titular para el tratamiento de sus datos.</li>
        <li><strong>Encargado del tratamiento:</strong> la persona que trata datos personales por cuenta del responsable.</li>
      </ul>

      <h2>3. Datos que recolectamos</h2>
      <p>Recolectamos únicamente los datos que nos entregas de forma voluntaria y los necesarios para operar el sitio:</p>
      <ul>
        <li>
          <strong>Identificación y contacto:</strong> nombre, apellido, número de celular, correo electrónico y número
          de cédula, a través de los formularios de interés de compra, venta de tu vehículo, compra de un vehículo
          de nuestra vitrina y solicitud de financiación.
        </li>
        <li>
          <strong>Información del vehículo:</strong> marca, línea, modelo, kilometraje, precio esperado, ciudad de
          matrícula y las fotografías que cargas cuando nos ofreces tu vehículo.
        </li>
        <li><strong>Preferencia de contacto:</strong> si aceptas que te contactemos por WhatsApp.</li>
        <li>
          <strong>Datos de navegación:</strong> información técnica como páginas visitadas, tipo de dispositivo,
          navegador y ubicación aproximada, recolectada mediante Google Analytics, y las señales que utiliza
          Google reCAPTCHA para distinguir personas de programas automatizados.
        </li>
      </ul>
      <p>
        No solicitamos datos sensibles, como información de salud, origen racial, orientación política o datos
        biométricos, ni recolectamos intencionalmente datos de niños, niñas o adolescentes.
      </p>

      <h2>4. Finalidades del tratamiento</h2>
      <p>Tus datos se usan exclusivamente para:</p>
      <ul>
        <li>Contactarte para atender tu solicitud de compra, venta o consignación de un vehículo.</li>
        <li>Evaluar el vehículo que nos ofreces y, si llegamos a un acuerdo, publicarlo en nuestra vitrina.</li>
        <li>Elaborar los documentos de la negociación, como el contrato de compraventa, y adelantar los trámites asociados.</li>
        <li>Atender tu solicitud de financiación y gestionarla ante las entidades financieras con las que trabajamos, cuando así lo solicites.</li>
        <li>Informarte cuando tengamos disponible un vehículo que coincida con lo que buscas.</li>
        <li>Cumplir obligaciones legales, contables y tributarias.</li>
        <li>Medir el uso del sitio web, mejorar nuestros servicios y prevenir fraudes o abusos en los formularios.</li>
      </ul>
      <p>No vendemos ni alquilamos tus datos personales.</p>

      <h2>5. Autorización</h2>
      <p>
        Al diligenciar nuestros formularios y marcar la casilla de aceptación, nos otorgas tu autorización previa,
        expresa e informada para tratar tus datos conforme a esta política. Conservamos prueba de esa
        autorización. No se requiere autorización cuando los datos sean de naturaleza pública, cuando la ley lo
        disponga o en los demás casos del artículo 10 de la Ley 1581 de 2012.
      </p>

      <h2>6. Derechos del titular</h2>
      <p>De acuerdo con el artículo 8 de la Ley 1581 de 2012, tienes derecho a:</p>
      <ul>
        <li>Conocer, actualizar y rectificar tus datos personales.</li>
        <li>Solicitar prueba de la autorización otorgada.</li>
        <li>Ser informado, previa solicitud, sobre el uso que hemos dado a tus datos.</li>
        <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley, una vez agotado el trámite de consulta o reclamo ante nosotros.</li>
        <li>Revocar la autorización y solicitar la supresión de tus datos, salvo cuando exista un deber legal o contractual de conservarlos.</li>
        <li>Acceder gratuitamente a tus datos personales objeto de tratamiento.</li>
      </ul>

      <h2>7. Procedimiento para consultas y reclamos</h2>
      <p>
        Puedes ejercer tus derechos a través de nuestro WhatsApp{' '}
        <a href={contactHref} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}</a>{' '}
        o de forma presencial en nuestra sala de ventas. Tu solicitud debe incluir tu nombre completo, número de
        identificación, la descripción de lo que solicitas y el medio por el cual quieres recibir respuesta.
        También pueden presentarla tus causahabientes o tu representante, acreditando esa calidad.
      </p>
      <ul>
        <li>
          <strong>Consultas:</strong> se atenderán en un término máximo de diez (10) días hábiles contados a partir de
          su recibo. Si no es posible responder en ese plazo, te informaremos los motivos y la fecha de respuesta,
          que no superará cinco (5) días hábiles adicionales.
        </li>
        <li>
          <strong>Reclamos</strong> (corrección, actualización, supresión o incumplimiento): se atenderán en un término
          máximo de quince (15) días hábiles contados a partir del día siguiente a su recibo, prorrogables hasta por
          ocho (8) días hábiles adicionales informándote los motivos. Si el reclamo está incompleto, te pediremos
          completarlo dentro de los cinco (5) días siguientes; si pasan dos (2) meses sin que lo hagas, se entenderá
          que desististe.
        </li>
      </ul>

      <h2>8. Encargados y transferencia internacional</h2>
      <p>
        Para operar el sitio usamos proveedores que tratan datos por nuestra cuenta: Amazon Web Services, que aloja
        nuestros servidores en Estados Unidos, y Google LLC, para Google Analytics y Google reCAPTCHA. Esto
        constituye una transmisión internacional de datos, que realizamos bajo las condiciones de seguridad de
        estos proveedores y con tu autorización. Solo compartimos tus datos con entidades financieras cuando tú
        solicitas una financiación, y con autoridades cuando una norma o una orden judicial lo exija.
      </p>

      <h2>9. Seguridad y conservación</h2>
      <p>
        Adoptamos medidas técnicas, humanas y administrativas razonables para proteger tus datos contra pérdida,
        consulta, uso o acceso no autorizado, entre ellas conexiones cifradas, acceso restringido a la
        información y copias de respaldo. Conservamos tus datos mientras sean necesarios para las finalidades
        descritas y durante los plazos que exija la ley; por ejemplo, los documentos soporte de operaciones
        comerciales se conservan durante diez (10) años según el Código de Comercio. Cumplidos esos plazos, los
        suprimimos.
      </p>

      <h2>10. Cookies y herramientas de analítica</h2>
      <p>
        Nuestro sitio usa cookies de Google Analytics para entender cómo se usa la página. Puedes bloquear o
        eliminar las cookies desde la configuración de tu navegador; el sitio seguirá funcionando.
      </p>

      <h2>11. Vigencia y cambios</h2>
      <p>
        Esta política rige desde el {LAST_UPDATED}. Las bases de datos se mantendrán vigentes mientras se cumplan
        las finalidades descritas. Cualquier cambio sustancial se publicará en esta página antes de su
        aplicación.
      </p>
    </div>
  </div>
);

export default PrivacyPolicyPage;
