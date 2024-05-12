import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from "../Header/Header.jsx";
import Main from "../Main/Main.jsx";
import Footer from "../Footer/Footer.jsx";
import Films from "../Films/Films.jsx";
import Series from "../Series/Series.jsx";
import Anime from "../Anime/Anime.jsx";
import Player from "../Player/Player.jsx";
import Cartoon from "../Cartoon/Cartoon.jsx";
import Register from "../Register/Register.jsx";
import Profile from "../Profile/Profile.jsx";

function App() {
  // Удалите состояние activeSection, т.к. react-router-dom теперь будет управлять роутингом
  const [showRegister, setShowRegister] = React.useState(false);
  const handleShowRegister = () => setShowRegister(true);
  const handleCloseRegister = () => setShowRegister(false);

  return (
    <Router>
      <Header onLoginClick={handleShowRegister} />
      <div className="main-container">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/films" element={<Films />} />
          <Route path="/series" element={<Series />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/cartoon" element={<Cartoon />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/player/:movieId" element={<Player />} />
          {/* Добавьте дополнительные маршруты при необходимости */}
        </Routes>
      </div>
      {showRegister && (
        <div className="modal-overlay">
          <Register toggleForm={handleCloseRegister} />
        </div>
      )}
      <Footer />
    </Router>
  );
}

export default App;
