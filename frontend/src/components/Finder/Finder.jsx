import './Finder.css';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from "../Loading/Loading.jsx";

function Finder() {
    const navigate = useNavigate(); // Использование хука navigate
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query) return;
        try {
            setLoading(true);
            const response = await axios.get(`http://127.0.0.1:8000/api/v2/search/${query}/`);
            const filteredMovies = response.data.filter(movie => movie.poster);
            setMovies(filteredMovies);
            setModalOpen(true);
        } catch (error) {
            console.error('Ошибка при поиске фильмов:', error);
            setMovies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const closeModal = () => setModalOpen(false);

    const handleClickMovie = (movieId) => {
        navigate(`/player/${movieId}`); // Используем navigate для перехода
        closeModal();
    };

    return (
        <>
            <div className="search-finder">
                <input
                    type="text"
                    placeholder="Поиск фильмов..."
                    className="search-input-finder"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button className="search-button-finder" onClick={handleSearch}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>
            </div>
            {isLoading && <div className="loading"><Loading/></div>}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <span className="close-modal" onClick={closeModal}>&times;</span>
                        <div className="movies-list">
                            {movies.map(movie => (
                                <div key={movie.id} className="movie-item" onClick={() => handleClickMovie(movie.id)}>
                                    <img src={movie.poster} alt={movie.name} />
                                    <div className="details">
                                        <h3>{movie.name}</h3>
                                        <div className="year">{movie.year}</div>
                                        <p>{movie.description || "Описание отсутствует"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Finder;
