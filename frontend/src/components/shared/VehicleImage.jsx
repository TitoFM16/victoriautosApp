import { useState } from 'react';
import PropTypes from 'prop-types';

// The shimmer sits behind the image: a missed load event can never hide a photo.
function VehicleImage({ src, alt, eager = false, className = '', ...imageProps }) {
  const [loadedSource, setLoadedSource] = useState(null);
  const [failedSource, setFailedSource] = useState(null);
  const failed = !src || failedSource === src;

  return (
    <div className={`vehicle-image ${!failed && loadedSource !== src ? 'is-loading' : ''} ${className}`}>
      {failed ? (
        <span className="vehicle-image-fallback">Imagen próximamente</span>
      ) : (
        <img
          width={800}
          height={600}
          {...imageProps}
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          decoding="async"
          onLoad={() => setLoadedSource(src)}
          onError={() => setFailedSource(src)}
        />
      )}
    </div>
  );
}

VehicleImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  eager: PropTypes.bool,
  className: PropTypes.string,
};

export default VehicleImage;
