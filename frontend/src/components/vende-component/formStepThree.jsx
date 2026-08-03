import { useState } from 'react';
import PropTypes from 'prop-types';

// Constants for image resizing
const MAX_WIDTH = 1080;
const MAX_HEIGHT = 1350;
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

const photoSlots = [
  { name: 'frenteImg', label: 'Frente' },
  { name: 'traseroImg', label: 'Trasera' },
  { name: 'lateralIzqImg', label: 'Lateral izquierda' },
  { name: 'lateralDerImg', label: 'Lateral Derecha' },
  { name: 'interiorImg', label: 'Interior' },
  { name: 'motorImg', label: 'Motor' },
];

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
    <div className="mt-8 border border-zinc-200 bg-white p-6 sm:p-10">
      <div className="grid gap-6 sm:grid-cols-2">
        {photoSlots.map(({ name, label }) => (
          <div key={name}>
            <label className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500" htmlFor={name}>{label}</label>
            <div className="mt-2 flex overflow-hidden rounded-xl border border-zinc-300">
              <label
                className="flex shrink-0 cursor-pointer items-center bg-zinc-100 px-4 text-xs font-black uppercase tracking-[0.1em] text-victoria-dark transition hover:bg-zinc-200"
                htmlFor={name}
              >
                Buscar
              </label>
              <input
                type="file"
                className="hidden"
                id={name}
                name={name}
                onChange={handleFileChange}
                accept="image/*"
              />
              <span className="flex h-12 flex-1 items-center truncate bg-white px-3 text-sm text-zinc-500">
                {fileNames[name] || 'Ningún archivo seleccionado'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
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
