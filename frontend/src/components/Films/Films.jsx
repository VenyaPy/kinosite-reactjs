import './Films.css';
import { useState, useEffect} from 'react';
import { Link, Element, Events, animateScroll as scroll } from 'react-scroll';

const CustomScrollLink = ({ to, children }) => (
  <Link activeClass="active" to={to} spy={true} smooth={true} duration={500} horizontal={true}>
    {children}
  </Link>
);

export default function Films() {
  const [films, setFilms] = useState([]);

  useEffect(() => {
    fetch('https://ve.po2014.fvds.ru:80/api/v1/main')
      .then(response => response.json())
      .then(data => setFilms(data.slice(0, 30)))
      .catch(error => console.error('Ошибка при загрузке данных:', error));
  }, []);

  return (
    <div className="films-wrapper">
      {films.map((film, index) => (
        <Element name={`film-${index}`} key={index} className='film-item'>
          <img src={film.poster} alt={film.name} />
          <h3>{film.name}</h3>
          <p>{film.description || "Описание отсутствует"}</p>
        </Element>
      ))}
      {films.length > 0 && (
        <>
          <CustomScrollLink to="film-0">Scroll to Start</CustomScrollLink>
          <CustomScrollLink to={`film-${films.length - 1}`}>Scroll to End</CustomScrollLink>
        </>
      )}
    </div>
  );
}