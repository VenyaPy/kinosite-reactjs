import { useState } from 'react';
import './App.css';
import Header from "./components/Header/Header.jsx";
import Main from "./components/Main/Main.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Films from "./components/Films/Films.jsx";
import Series from "./components/Series/Series.jsx";
import Anime from "./components/Anime/Anime.jsx";
import { AnimatePresence } from 'framer-motion';

function App() {
  const [activeSection, setActiveSection] = useState('main');

  const SectionComponent = () => {
    switch(activeSection) {
      case 'main':
        return <Main />;
      case 'films':
        return <Films />;
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
          <SectionComponent key={activeSection} />
        </AnimatePresence>
      </div>
      <Footer/>
    </>
  )
}

export default App;
