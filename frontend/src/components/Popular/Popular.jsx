import './Popular.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from "../Loading/Loading.jsx";

export default function Popular() {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const scrollContainer = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Элементы массива меняются местами
    }
  }

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/v2/movies')
      .then(response => response.json())
      .then(data => {
        const selectedFilms = data.filter(film => film.poster) // Отбираем только фильмы с постерами
                                   .slice(5, 120);
        shuffleArray(selectedFilms);
        setFilms(selectedFilms);
      })
      .catch(error => {
        console.error('Ошибка при загрузке данных:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
    navigate(`/player/${filmId}`); // Используем navigate для перехода
  };

  return (
    <div className="films-wrapper">
      <div id="films-container" ref={scrollContainer} className='films-container'>
        {isLoading ? (
          <div className="loading-wrapper">
            <Loading />
          </div>
        ) : (
          <AnimatePresence>
            {films.map((film, index) => (
              <motion.div
                key={index}
                className='film-item'
                onClick={() => handleFilmClick(film.id)} // Действие по клику
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <img src={`/api/v2/images/photo_${film.id}.jpeg`} // Используем film.id вместо movie.id
                  alt={film.name}
                  onLoad={() => console.log(`Изображение для фильма с id ${film.id} успешно загружено`)}
                  onError={() => console.error(`Ошибка загрузки изображения для фильма с id ${film.id}`)}
                />
                <h3>{film.name}</h3>
                <p>{film.description || "Описание отсутствует"}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      <button onClick={scrollRight} className="scroll-button"><i className="fa-solid fa-arrow-right"></i></button>
    </div>
  );
}
