import React from 'react';
import Item from './Components/Item';
import './App.css';
import logo from './logo.jpg';

function App() {
  return (
    <div className="container">
      <img className="logo" src={logo} />
      <h1>Price Tracker</h1>
      <Item />
    </div>
  );
}

export default App;
