import PropTypes from 'prop-types';
import './TitleBanner.css';

const TitleBanner = ({ topText, highlightText, isBanner = false }) => {

  return (
    <div className="hero-banner-as-title">
      <h1 className="hero-title-as-title">
        <div className="top-container-as-title">
          <span className="top-text-as-title">{topText}</span>
        </div>
        <div className="highlight-container-as-title">
          <span className="highlight-text-as-title">{highlightText}</span>
        </div>
      </h1>
    </div>
  );
};

TitleBanner.propTypes = {
  topText: PropTypes.string.isRequired,
  highlightText: PropTypes.string.isRequired,
  isBanner: PropTypes.bool,
};

export default TitleBanner;
