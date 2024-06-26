import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Header from "../Header/Header.jsx";
import Main from "../Main/Main.jsx";
import Films from "../Films/Films.jsx";
import Series from "../Series/Series.jsx";
import Anime from "../Anime/Anime.jsx";
import Player from "../Player/Player.jsx";
import SharedPlayer from "../SharedPlayer/SharedPlayer.jsx";
import Cartoon from "../Cartoon/Cartoon.jsx";
import Register from "../Register/Register.jsx";
import Rooms from "../Rooms/Rooms.jsx";
import Youtube from "../Youtube/Youtube.jsx";
import Admin from "../Admin/Admin.jsx";

const App = () => {
  const [showRegister, setShowRegister] = React.useState(false);
  const handleShowRegister = () => setShowRegister(true);
  const handleCloseRegister = () => setShowRegister(false);

  return (
    <Router>
      <Header onLoginClick={handleShowRegister} />
      <div className="main-container">
        <AnimatedRoutes />
      </div>
      {showRegister && (
        <div className="modal-overlay">
          <Register toggleForm={handleCloseRegister} />
        </div>
      )}
    </Router>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={location.key}
        classNames="slide"
        timeout={300}
      >
        <Routes location={location}>
          <Route path="/" element={<Main />} />
          <Route path="/films" element={<Films />} />
          <Route path="/series" element={<Series />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/cartoon" element={<Cartoon />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/youtube/:roomId" element={<Youtube />} />
          <Route path="/player/:movieId" element={<Player />} />
          <Route path="/shared/:roomId" element={<SharedPlayer />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default App;
