import './Popular.css';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from "prop-types";

export default function Popular({ setActiveSection }) {
  const [films, setFilms] = useState([]);
  const scrollContainer = useRef(null);

  useEffect(() => {
    fetch('https://ve.po2014.fvds.ru:80/api/v1/main')
      .then(response => response.json())
      .then(data => setFilms(data.slice(0, 100)))
      .catch(error => console.error('Ошибка при загрузке данных:', error));
  }, []);

  const scrollRight = () => {
    if (scrollContainer.current) {
      const containerWidth = scrollContainer.current.offsetWidth;
      scrollContainer.current.scrollBy({
        left: containerWidth - 200,
        behavior: 'smooth'
      });
    }
  };

  const handleFilmClick = (filmId) => {
    setActiveSection({ section: 'player', params: { movieId: filmId } });
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 0 }
  };

  return (
    <div className="films-wrapper">
      <div id="films-container" ref={scrollContainer} className='films-container'>
        <AnimatePresence>
          {films.map((film, index) => (
            <motion.div
              key={index}
              className='film-item'
              onClick={() => handleFilmClick(film.id)} // Используйте правильный идентификатор в зависимости от вашего API
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
            >
              <img src={film.poster} alt={film.name} />
              <h3>{film.name}</h3>
              <p>{film.description || "Описание отсутствует"}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <button onClick={scrollRight} className="scroll-button"><i className="fa-solid fa-arrow-right"></i></button>
    </div>
  );
}

Popular.propTypes = {
  setActiveSection: PropTypes.func.isRequired,
};
