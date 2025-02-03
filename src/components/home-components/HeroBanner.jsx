import PropTypes from 'prop-types';
import './HeroBanner.css';

const HeroBanner = ({ topText, highlightText, isBanner = false }) => {
  // Dynamically generate the class name
  const getClassName = (baseClass) => {
    return isBanner ? baseClass : `${baseClass}-as-title`;
  };

  return (
    <div className={getClassName("hero-banner")}>
      <h1 className={getClassName("hero-title")}>
        <div className={getClassName("top-container")}>
          <span className={getClassName("top-text")}>{topText}</span>
        </div>
        <div className={getClassName("highlight-container")}>
          <span className={getClassName("highlight-text")}>{highlightText}</span>
        </div>
      </h1>
    </div>
  );
};

HeroBanner.propTypes = {
  topText: PropTypes.string.isRequired,
  highlightText: PropTypes.string.isRequired,
  isBanner: PropTypes.bool,
};

export default HeroBanner;
