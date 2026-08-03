import PropTypes from 'prop-types';
import './HeroBanner.css';

const HeroBanner = ({ topText, highlightText }) => {
  return (
    <div className="hero-banner">
      <h1 className="hero-title" style={{ contain: 'layout style paint' }}>
        <div className="top-container">
          <span className="top-text" style={{ willChange: 'transform' }}>{topText}</span>
        </div>
        <div className="highlight-container">
          <span className="highlight-text" style={{ willChange: 'transform' }}>{highlightText}</span>
        </div>
      </h1>
    </div>
  );
};

HeroBanner.propTypes = {
  topText: PropTypes.string.isRequired,
  highlightText: PropTypes.string.isRequired,
};

export default HeroBanner;
