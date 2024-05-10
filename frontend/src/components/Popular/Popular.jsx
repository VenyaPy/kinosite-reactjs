import './Popular.css';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from "prop-types";

export default function Popular({ setActiveSection }) {
  const [films, setFilms] = useState([]);
  const scrollContainer = useRef(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v2/mainpage')
      .then(response => response.json())
      .then(data => setFilms(data.slice(5, 100)))
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
    console.log("Film clicked, id:", filmId); // Добавьте для отладки
    setActiveSection({ section: 'player', params: { movieId: filmId } });
  };


  return (
    <div className="films-wrapper">
      <div id="films-container" ref={scrollContainer} className='films-container'>
        <AnimatePresence>
          {films.map((film, index) => (
            <motion.div
              key={index}
              className='film-item'
              onClick={() => handleFilmClick(film.id)}  // Убедитесь, что film.id действительно содержит корректный ID
              initial="hidden"
              animate="visible"
              exit="exit"
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
