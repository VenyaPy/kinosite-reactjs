import './Finder.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from "../Loading/Loading.jsx";


function Finder() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        if (isModalOpen) {
            document.documentElement.classList.add('no-scroll');
        } else {
            document.documentElement.classList.remove('no-scroll');
        }

        return () => {
            document.documentElement.classList.remove('no-scroll');
        };
    }, [isModalOpen]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 2) {
                setSuggestions([]); // Очищаем предложения, если меньше 2 символов
                return;
            }
            try {
                const response = await axios.post(`/api/v2/search/get_reference/${query}`);
                const names = response.data.map(item => item.name); // Извлекаем только имена
                setSuggestions(names);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        };

        fetchSuggestions();
    }, [query]);

    const handleSearch = async () => {
        if (!query) return;
        try {
            setLoading(true);
            const response = await axios.get(`/api/v2/search/${query}/`);
            const filteredMovies = response.data.filter(movie => movie.poster);
            setMovies(filteredMovies);
            setModalOpen(true);
            setSuggestions([]); // Очищаем предложения при запуске поиска
        } catch (error) {
            console.error('Error searching movies:', error);
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
        navigate(`/player/${movieId}`);
        closeModal();
    };

    const handleSuggestionChange = (suggestion) => {
        setQuery(suggestion); // Устанавливаем выбранное предложение в input
        setSuggestions([]); // Очищаем предложения
        handleSearch(); // Запускаем поиск
    };


    return (
        <>
            <div className="search-finder-unique">
                <input
                    type="text"
                    placeholder="Поиск фильмов..."
                    className="search-input-finder-unique"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button className="search-button-finder-unique" onClick={handleSearch}>
                    <i className="fa fa-search"></i>
                </button>
                {suggestions.length > 0 && (
                    <div className="suggestions-container" style={{ position: 'absolute', top: '100%', left: '0', width: '100%', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white', border: '1px solid #ccc', zIndex: 1000 }}>
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="suggestion-item"
                                onClick={() => handleSuggestionChange(suggestion)}
                                style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #ddd' }}
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {isLoading && <div className="loading-unique"><Loading/></div>}
            {isModalOpen && (
                <div className="modal-overlay-unique">
                    <div className="modal-content-unique">
                        <span className="close-modal-unique" onClick={closeModal}>&times;</span>
                        <div className="movies-list-unique">
                            <h2 className="find-text-films-unique">Найденные фильмы:</h2>
                            <div className="movies-list-scroll-unique">
                                {movies.map(movie => (
                                    <div key={movie.id} className="movie-item-unique" onClick={() => handleClickMovie(movie.id)}>
                                        <img src={movie.poster} alt={movie.name} className="movie-poster-unique" />
                                        <div className="details-unique">
                                            <h3>{movie.name}</h3>
                                            <div className="year-unique">{movie.year}</div>
                                            <p>{movie.description || "Описание недоступно"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Finder;
