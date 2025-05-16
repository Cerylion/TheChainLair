import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/main.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals';

document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
    }
}, false);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);

reportWebVitals(console.log);
