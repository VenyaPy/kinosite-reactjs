import './Finder.css'
import { useState } from 'react';
import axios from 'axios';


export default function Finder() {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);

    const handleSearch = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/v2/search/${query}/`);
            const filteredMovies = response.data.filter(movie => movie.poster);  // Фильтрация фильмов с наличием постера
            setMovies(filteredMovies);
        } catch (error) {
            console.error('Ошибка при поиске фильмов:', error);
            setMovies([]);
        }
    };

    return (
        <div className="finder-container">
            <div className="search-finder">
                <input
                    type="text"
                    placeholder="Поиск фильмов..."
                    className="search-input-finder"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button className="search-button-finder" onClick={handleSearch}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>
            </div>
            <div className="movies-list">
                {movies.map(movie => (
                    <div key={movie.id} className="movie-item">
                        <a href={movie.watch_url} target="_blank" rel="noopener noreferrer">
                            <img src={movie.poster} alt={movie.name}/>
                            <div className="details">
                                <h3>{movie.name}</h3>
                                <div className="year">{movie.year}</div>
                                <p>{movie.description || "Описание отсутствует"}</p>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}