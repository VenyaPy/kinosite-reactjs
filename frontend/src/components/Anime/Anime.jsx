import './Anime.css';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import Loading from "../Loading/Loading.jsx";

function Anime() {
    const apiKey = import.meta.env.VITE_API_KEY;
    const navigate = useNavigate();

    const [series, setSeries] = useState([]);
    const [year, setYear] = useState('');
    const [rating, setRating] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const years = Array.from({ length: 45 }, (_, i) => 2024 - i);
    const ratings = ["1-2", "3-4", "5-7", "7-8", "9-10"];

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    const fetchSeries = useCallback(() => {
        setIsLoading(true);
        let filtersApplied = year || rating;
        setIsFiltered(filtersApplied);
        let url = filtersApplied ?
            `https://api.kinopoisk.dev/v1.4/movie?page=1&limit=200&type=anime` :
            `https://ve1.po2014.fvds.ru:8000/api/v2/anime`;

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
                    watch_url: `https://kinowild.ru/player?${anime.id}`
                })) :
                data;
            shuffleArray(results);
            setSeries(results.filter(anime => anime.name && anime.poster && (anime.shortDescription || anime.description)));
            setIsLoading(false);
        })
        .catch(error => {
            console.error('Ошибка при поиске аниме:', error);
            setIsLoading(false);
        });
    }, [year, rating, apiKey]);

    useEffect(() => {
        fetchSeries();
    }, [fetchSeries]);

    useEffect(() => {
        window.scrollTo(0, 0); // Прокрутка страницы к началу при загрузке компонента
    }, []);

    const handleMovieClick = (id) => {
        navigate(`/player/${id}`);
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
            className="projects-container-m"
        >
            {isLoading ? (
                <Loading />
            ) : (
                <div>
                    <div className="unique-anime-filters-container">
                        <div className="unique-anime-filters">
                            <select value={year} onChange={e => setYear(e.target.value)}>
                                <option value="">Год</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <select value={rating} onChange={e => setRating(e.target.value)}>
                                <option value="">Рейтинг</option>
                                {ratings.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <button onClick={resetFilters}>Сбросить фильтры</button>
                        </div>
                    </div>
                    <div className="unique-popular-anime">
                        <h2>{isFiltered ? "Аниме по вашим критериям" : "Популярные аниме"}</h2>
                    </div>
                    {series.length === 0 ? (
                        <div className="no-movies">Нет аниме для отображения</div>
                    ) : (
                        <div className="unique-anime-section">
                            {series.map(anime => (
                                anime.poster && (
                                    <div onClick={() => handleMovieClick(anime.id)} key={anime.id} className="unique-anime">
                                        <img src={anime.poster} alt={anime.name} className="unique-anime-poster"/>
                                        <div className="unique-anime-overlay">
                                            <i className="fa-solid fa-play unique-play-icon"></i>
                                            <div className="unique-anime-info">
                                                <div className="unique-anime-title">{anime.name}</div>
                                                <div className="unique-anime-description">{anime.shortDescription || anime.description}</div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}

export default Anime;
