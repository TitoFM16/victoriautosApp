import Main from './components/MainComponent';
import './App.css';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import {store} from './redux/configureStore';
import { HelmetProvider } from 'react-helmet-async';

function App() {

  return (
    <>
      <HelmetProvider>
        <Provider store={store}>  
          <BrowserRouter>
              <Main />
          </BrowserRouter>
        </Provider>
      </HelmetProvider>
    </>
  )
}

export default App
