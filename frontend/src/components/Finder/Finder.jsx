import './Finder.css';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from "../Loading/Loading.jsx";

function Finder() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query) return;
        try {
            setLoading(true);
            const response = await axios.get(`https://kinowild.ru/api/v2/search/${query}/`);
            const filteredMovies = response.data.filter(movie => movie.poster);
            setMovies(filteredMovies);
            setModalOpen(true);
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
                    <i className="fa fa-search"></i>
                </button>
            </div>
            {isLoading && <div className="loading"><Loading/></div>}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <span className="close-modal" onClick={closeModal}>&times;</span>
                        <div className="movies-list">
                            <h2 className="find-text-films">Найденные фильмы:</h2>
                            {movies.map(movie => (
                                <div key={movie.id} className="movie-item" onClick={() => handleClickMovie(movie.id)}>
                                    <img src={movie.poster} alt={movie.name} />
                                    <div className="details">
                                        <h3>{movie.name}</h3>
                                        <div className="year">{movie.year}</div>
                                        <p>{movie.description || "Описание недоступно"}</p>
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
