const steps = [
  { number: '01', eyebrow: 'Contacto', title: 'Cuéntanos quién eres' },
  { number: '02', eyebrow: 'Vehículo', title: 'Describe tu usado' },
  { number: '03', eyebrow: 'Fotografías', title: 'Muéstranos su estado' },
];

const FormStep0 = () => {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-5">
      {steps.map((step) => (
        <div key={step.title} className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_14px_40px_rgba(17,19,21,0.05)] sm:block sm:p-6 sm:text-center">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-victoria-dark text-sm font-black tracking-[0.08em] text-white sm:mx-auto sm:h-14 sm:w-14" aria-hidden="true">
            {step.number}
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-victoria-red sm:mt-4">{step.eyebrow}</p>
            <p className="mt-1 text-sm font-black leading-5 text-victoria-dark">{step.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FormStep0;
