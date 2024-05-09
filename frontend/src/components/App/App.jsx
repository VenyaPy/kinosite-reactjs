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

function App() {
  const [activeSection, setActiveSection] = useState({ section: 'main', params: {} });
  console.log("Current activeSection:", activeSection);
  const SectionComponent = () => {
    switch(activeSection.section) {
      case 'main':
        return <Main />;
      case 'films':
        return <Films setActiveSection={setActiveSection} />;
      case 'player':
        return <Player movieId={activeSection.params.movieId} />;
      case 'series':
        return <Series />;
      case 'anime':
        return <Anime />;
      default:
        return <Main />;
    }
  };

  return (
    <>
      <Header setActiveSection={setActiveSection} />
      <div className="main-container">
        <AnimatePresence mode="wait">
          <SectionComponent key={activeSection.section} />
      </AnimatePresence>
      </div>
      <Footer />
    </>
  );
}

export default App;
