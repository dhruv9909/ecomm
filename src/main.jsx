import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from './redux/app/store.jsx'
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <ToastContainer position='top-center' draggable toastStyle={{
          width: "250px",
          fontSize: '0.7rem',
          marginLeft: '22rem'
        }}/>
    </Provider>
  </StrictMode>,
)
