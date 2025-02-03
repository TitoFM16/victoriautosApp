import Main from './components/MainComponent';
import './App.css';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import {store} from './redux/configureStore';
import LazyLoadIcons from './components/shared/LazyLoadIcons';

function App() {

  return (
    <>
      <Provider store={store}>  
        <BrowserRouter>
            <LazyLoadIcons />
            <Main />
        </BrowserRouter>
      </Provider>
    </>
  )
}

export default App
