import './Films.css';
import { useState, useEffect, useRef } from 'react';


export default function Films() {
  const [films, setFilms] = useState([]);
  const scrollContainer = useRef(null);

  useEffect(() => {
    fetch('https://ve.po2014.fvds.ru:80/api/v1/main')
      .then(response => response.json())
      .then(data => setFilms(data.slice(0, 100))) // Загружаем только первые 30 фильмов для улучшения производительности
      .catch(error => console.error('Ошибка при загрузке данных:', error));
  }, []);

  const scrollRight = () => {
    if (scrollContainer.current) {
      const containerWidth = scrollContainer.current.offsetWidth;
      scrollContainer.current.scrollBy({
        left: containerWidth - 200, // скроллим на ширину контейнера минус 100 пикселей
        behavior: 'smooth' // плавная прокрутка
      });
    }
  };

  return (
    <div className="films-wrapper">
      <div id="films-container" ref={scrollContainer} className='films-container'>
        {films.map((film, index) => (
          <div key={index} className='film-item'>
            <img src={film.poster} alt={film.name} />
            <h3>{film.name}</h3>
            <p>{film.description || "Описание отсутствует"}</p>
          </div>
        ))}
      </div>
      <button onClick={scrollRight} className="scroll-button"><i className="fa-solid fa-arrow-right"></i></button>
    </div>
  );
}