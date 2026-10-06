import PropTypes from 'prop-types';

export const PRIVACY_CONSENT_MESSAGE =
  'Para continuar debes aceptar la política de tratamiento de datos personales.';

// Required data-processing authorization (Ley 1581 de 2012). Each form also
// checks `checked` before submitting, because not every submit button is a
// native form submit.
function PrivacyConsent({ checked, onChange, className = 'vf-check' }) {
  return (
    <label className={className} htmlFor="privacyConsent">
      <input
        id="privacyConsent"
        name="privacy"
        type="checkbox"
        checked={checked}
        onChange={onChange}
        required
        aria-required="true"
      />
      <span>
        He leído y acepto la{' '}
        <a href="/politicas-de-privacidad" target="_blank" rel="noopener noreferrer">
          política de tratamiento de datos personales
        </a>
        .
      </span>
    </label>
  );
}

PrivacyConsent.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default PrivacyConsent;
