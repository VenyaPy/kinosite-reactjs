import { useState, useEffect, useCallback } from "react";
import './Anime.css'
import { motion } from "framer-motion";
import PropTypes from "prop-types";


function Anime({ setActiveSection }) {
    const apiKey = import.meta.env.VITE_API_KEY;

    const [series, setSeries] = useState([]);
    const [year, setYear] = useState('');
    const [rating, setRating] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);

    const years = Array.from({length: 45}, (_, i) => 2024 - i);
    const ratings = ["1-3", "3-5", "5-7", "7-10"];

    // Функция для перемешивания массива
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    const fetchSeries = useCallback(() => {
        let filtersApplied = year || rating;
        setIsFiltered(filtersApplied);
        let url = filtersApplied ?
            'https://api.kinopoisk.dev/v1.4/movie?page=1&limit=200&type=anime' :
            'http://127.0.0.1:8000/api/v2/anime';

        if (year) url += `&year=${year}`;
        if (rating) url += `&rating.imdb=${rating}`;

        fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'X-API-KEY': apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            const results = url.includes("kinopoisk.dev") ?
                data.docs.map(anime => ({
                    ...anime,
                    poster: anime.poster ? anime.poster.previewUrl : null,
                    watch_url: `http://127.0.0.1:8000/v/player?id=${anime.id}`
                })) :
                data;
            shuffleArray(results);  // Перемешиваем результаты
            setSeries(results.filter(anime => anime.name && anime.poster && (anime.shortDescription || anime.description)));
        })
        .catch(error => console.error('Ошибка при поиске аниме:', error));
    }, [year, rating, apiKey]);

    useEffect(() => {
        fetchSeries();
    }, [fetchSeries]);

    const handleMovieClick = (id) => {
        setActiveSection({ section: 'player', params: { movieId: id } });
    };

    const resetFilters = () => {
        setYear('');
        setRating('');
        setIsFiltered(false);
        fetchSeries();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="projects-container"
        >
            <div>
                <div className="filters">
                    <select value={year} onChange={e => setYear(e.target.value)}>
                        <option value="">Год</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={rating} onChange={e => setRating(e.target.value)}>
                        <option value="">Рейтинг</option>
                        {ratings.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div className="popular-movie">
                    <h2>{isFiltered ? "Аниме по вашим критериям" : "Популярные аниме"}</h2>
                </div>
                <div className="movies-section">
                    {series.map(anime => (
                        anime.poster && (
                            <div onClick={() => handleMovieClick(anime.id)} key={anime.id} className="movie">
                                <img src={anime.poster} alt={anime.name} className="movie-poster"/>
                                <div className="movie-overlay">
                                    <i className="fa-solid fa-play play-icon"></i>
                                    <div className="movie-info">
                                        <div className="movie-title">{anime.name}</div>
                                        <div className="movie-description">{anime.shortDescription || anime.description}</div>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

Anime.propTypes = {
    setActiveSection: PropTypes.func.isRequired,
};

export default Anime;