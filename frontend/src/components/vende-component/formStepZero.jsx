const steps = [
  { icon: 'ℹ', title: 'Ingresa tus datos' },
  { icon: '🚗', title: 'Ingresa los datos del Vehículo' },
  { icon: '📷', title: 'Sube fotos del Vehículo' },
];

const FormStep0 = () => {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-3">
      {steps.map((step) => (
        <div key={step.title} className="border border-zinc-200 bg-white p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-victoria-dark text-xl text-white" aria-hidden="true">
            {step.icon}
          </div>
          <p className="mt-4 text-sm font-black text-victoria-dark">{step.title}</p>
        </div>
      ))}
    </div>
  );
};

export default FormStep0;
