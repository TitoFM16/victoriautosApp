import { useNavigate,useParams,useLocation } from "react-router-dom";

export const withRouter = (Component) => {
  const Wrapper = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    return (
      <Component
      {...props}
        navigate={navigate}
        location={location}
        params = {params}
        />
    );
  };
  
  return Wrapper;
};

