import PropTypes from 'prop-types';
import './HeroBanner.css';

const HeroBanner = ({ topText, highlightText }) => {

  return (
    <div className="hero-banner">
      <h1 className="hero-title">
        <div className="top-container">
          <span className="top-text">{topText}</span>
        </div>
        <div className="highlight-container">
          <span className="highlight-text">{highlightText}</span>
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
