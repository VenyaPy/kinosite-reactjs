import './Popular.css';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from "prop-types";


export default function Popular({ setActiveSection }) {
  const [films, setFilms] = useState([]);
  const scrollContainer = useRef(null);

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Элементы массива меняются местами
    }
  }

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v2/mains')
      .then(response => response.json())
      .then(data => {
        const selectedFilms = data.slice(5, 120); // Выборка фильмов
        shuffleArray(selectedFilms); // Перемешиваем выбранные фильмы
        setFilms(selectedFilms);
      })
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
              onClick={() => handleFilmClick(film.id)} // Убедитесь, что film.id действительно содержит корректный ID
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