import { useNavigate } from 'react-router-dom';
import iphoneImage from '../../assets/images/iphone-vende-vehiculo.webp';
import iphoneImageMobile from '../../assets/images/iphone-vende-vehiculo-mobile.webp';

const InvitaVentaComponent = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[.88fr_1.12fr] lg:gap-20">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-victoria-red">Vende con respaldo</p>
          <h2 className="mt-4 max-w-xl !text-4xl font-black leading-[0.94] tracking-[-0.055em] text-victoria-dark sm:!text-6xl">Tu usado también merece una buena negociación.</h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-zinc-600 sm:text-lg">
            Cuéntanos los datos de tu vehículo. Te orientamos con una valoración inicial y te acompañamos durante el proceso de venta.
          </p>
          <ul className="mt-8 space-y-3 border-l-2 border-victoria-red pl-5 text-sm font-bold text-zinc-700">
            <li>Valoración clara y sin compromiso</li>
            <li>Exhibición en nuestra vitrina</li>
            <li>Acompañamiento documental</li>
          </ul>
          <button 
            className="mt-9 bg-victoria-red px-7 py-4 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-red-800"
            onClick={() => navigate('/vende')}
          >
            Quiero vender mi vehículo →
          </button>
        </div>
        <figure className="overflow-hidden bg-zinc-100">
          <figcaption className="bg-victoria-dark px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white sm:text-left">
            Proceso simple · Atención humana
          </figcaption>
          <div className="relative min-h-[390px] sm:min-h-[480px]">
            <img
              src={iphoneImage}
              srcSet={`${iphoneImageMobile} 680w, ${iphoneImage} 1200w`}
              sizes="(max-width: 1023px) 100vw, 55vw"
              alt="Proceso digital para vender un vehículo con Victoriautos"
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </figure>
      </div>
    </section>
  );
};

export default InvitaVentaComponent;
