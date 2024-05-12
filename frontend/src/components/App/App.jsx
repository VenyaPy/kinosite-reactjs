import { useState } from 'react';
import './App.css';
import Header from "../Header/Header.jsx";
import Main from "../Main/Main.jsx";
import Footer from "../Footer/Footer.jsx";
import Films from "../Films/Films.jsx";
import Series from "../Series/Series.jsx";
import Anime from "../Anime/Anime.jsx";
import { AnimatePresence } from 'framer-motion';
import Player from "../Player/Player.jsx";
import Cartoon from "../Cartoon/Cartoon.jsx";
import Register from "../Register/Register.jsx";
import Profile from "../Profile/Profile.jsx";

function App() {
  const [activeSection, setActiveSection] = useState({ section: 'main', params: {} });
  const [showRegister, setShowRegister] = useState(false);

  const SectionComponent = () => {
    switch(activeSection.section) {
      case 'main':
        return <Main setActiveSection={setActiveSection}  />;
      case 'films':
        return <Films setActiveSection={setActiveSection} />;
      case 'player':
        return <Player movieId={activeSection.params.movieId} />;
      case 'series':
        return <Series setActiveSection={setActiveSection} />;
      case 'cartoon':
        return <Cartoon setActiveSection={setActiveSection} />;
      case 'profile':
        return <Profile />;
      case 'anime':
        return <Anime setActiveSection={setActiveSection} />;
      default:
        return <Main setActiveSection={setActiveSection}  />;
    }
  };


  const handleShowRegister = () => setShowRegister(true);
  const handleCloseRegister = () => setShowRegister(false);

  return (
          <>
              <Header setActiveSection={setActiveSection} onLoginClick={handleShowRegister} />
              <div className="main-container">
                  <AnimatePresence mode="wait">
                      <SectionComponent key={activeSection.section} />
                  </AnimatePresence>
              </div>
              {showRegister && (
                  <div className="modal-overlay">
                      <Register toggleForm={handleCloseRegister} />
                  </div>
              )}
              <Footer />
          </>
      );
  }

  export default App;
