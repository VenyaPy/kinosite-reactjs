import './Finder.css'
import {useState} from 'react';
import axios from 'axios';
import PropTypes from "prop-types";


function Finder({ setActiveSection }) {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isLoading, setLoading] = useState(false); // Добавляем состояние загрузки

    const handleSearch = async () => {
        if (!query) return;
        try {
            setLoading(true); // Показываем загрузку при начале запроса
            const response = await axios.get(`http://127.0.0.1:8000/api/v2/search/${query}/`);
            const filteredMovies = response.data.filter(movie => movie.poster);
            setMovies(filteredMovies);
            setModalOpen(true);
        } catch (error) {
            console.error('Ошибка при поиске фильмов:', error);
            setMovies([]);
        } finally {
            setLoading(false); // Скрываем загрузку после завершения запроса
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const closeModal = () => {
        setModalOpen(false);
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
            {/* Показываем загрузку, если isLoading === true */}
            {isLoading && <div className="loading">Загрузка...</div>}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <span className="close-modal" onClick={closeModal}>&times;</span>
                        <div className="movies-list">
                            {movies.map(movie => (
                                <div key={movie.id} className="movie-item" onClick={() => setActiveSection({ section: 'player', params: { movieId: movie.id } })}>
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

Finder.propTypes = {
    setActiveSection: PropTypes.func.isRequired,
};

export default Finder;