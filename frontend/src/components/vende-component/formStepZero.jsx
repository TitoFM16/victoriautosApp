const steps = [
  { icon: 'person', title: 'Tus datos', text: 'Cómo contactarte' },
  { icon: 'directions_car', title: 'Tu vehículo', text: 'Marca, modelo y precio' },
  { icon: 'photo_camera', title: 'Fotos', text: '6 fotos de tu carro' },
];

const FormStep0 = () => {
  return (
    <ol className="vf-intro-steps">
      {steps.map((step) => (
        <li key={step.title}>
          <span className="vf-intro-icon" aria-hidden="true">
            <span className="material-symbols-outlined">{step.icon}</span>
          </span>
          <div>
            <strong>{step.title}</strong>
            <span className="vf-intro-text">{step.text}</span>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default FormStep0;
