import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/base.css';
import './styles/Navbar.css';
import './styles/Footer.css';
import './styles/Home.css';
import './styles/Menu.css';
import './styles/Bakery.css';
import './styles/About.css';
import './styles/Contact.css';
import './styles/Auth.css';
import './styles/ProductDetail.css';
import './styles/Cart.css';
import './styles/Checkout.css';
import './styles/Profile.css';
import './styles/Admin.css';
import './styles/OrderSuccess.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

