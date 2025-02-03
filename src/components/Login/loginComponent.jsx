//  login component for jwt authentication
//  for layout won't be used external library, just bootstrap 
//  for form validation, won't be used external library, just bootstrap 

import { useDispatch } from 'react-redux';
import { login } from '../../redux/actions/loginActions';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function LoginComponent() {
        
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [, setError] = useState(null);
  const navigate = useNavigate();
  
  const handleSubmit = async event => {
    event.preventDefault();

    try {
      await dispatch(login(username, password));
      // Redirect to the home page or show a success message
      navigate("/admin")
    //   return <Navigate to="/admin" replace />
    } catch (error) {
      setError(error.message);
    }
  };

    return (
        <div className="container">
            <div className="row row-content">
                <div className="col-12">
                    <h3>Login</h3>
                </div>
                <div className="col-12 col-md-9">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group row">
                            <label htmlFor="username" className="col-md-2 col-form-label">Username</label>
                            <div className="col-md-10">
                                <input type="text" id="username" name="username"
                                    placeholder="Username"
                                    className="form-control"
                                    value={username} onChange={event => setUsername(event.target.value)} />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="password" className="col-md-2 col-form-label">Password</label>
                            <div className="col-md-10">
                                <input type="password" id="password" name="password"
                                    placeholder="Password"
                                    className="form-control"
                                    value={password} onChange={event => setPassword(event.target.value)} />
                            </div>
                        </div>
                        <div className="form-group row">
                            <div className="offset-md-2 col-md-10">
                                <button type="submit" className="btn btn-primary">
                                    Login
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
        
}




export default (LoginComponent);


