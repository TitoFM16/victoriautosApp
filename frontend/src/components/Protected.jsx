import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function Protected({ isAuth, children }) {
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

Protected.propTypes = {
  isAuth: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired
};

export default Protected;