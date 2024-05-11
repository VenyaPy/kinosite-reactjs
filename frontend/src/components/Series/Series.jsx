import { useState, useEffect, useCallback } from "react";
import './Series.css'
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import Loading from "../Loading/Loading.jsx";


export default function Series({ setActiveSection }) {
    const apiKey = import.meta.env.VITE_API_KEY;

    const [series, setSeries] = useState([]);
    const [year, setYear] = useState('');
    const [rating, setRating] = useState('');
    const [genre, setGenre] = useState('');
    const [country, setCountry] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Новое состояние для индикации загрузки

    const years = Array.from({ length: 45 }, (_, i) => 2024 - i);
    const ratings = ["1-3", "3-5", "5-7", "7-10"];
    const genres = ["драма", "комедия", "мелодрама", "ужасы", "фэнтези", "боевик", "семейный", "приключения", "детектив", "триллер", "фантастика", "документальный", "биография", "для взрослых", "короткометражка", "криминал"];
    const countries = ["США", "Великобритания", "Франция", "Германия", "Италия", "Канада", "Австралия", "Индия", "Япония", "Южная Корея", "Испания", "Россия", "Китай", "Швеция", "Бразилия"];

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    const fetchSeries = useCallback(() => {
        setIsLoading(true);  // Включение индикатора загрузки
        let filtersApplied = year || rating || genre || country;
        setIsFiltered(filtersApplied);
        let url = filtersApplied ?
            'https://api.kinopoisk.dev/v1.4/movie?page=1&limit=200&type=tv-series' :
            'http://127.0.0.1:8000/api/v2/series';

        if (year) url += `&year=${year}`;
        if (rating) url += `&rating.imdb=${rating}`;
        if (genre) url += `&genres.name=${encodeURIComponent(genre)}`;
        if (country) url += `&countries.name=${encodeURIComponent(country)}`;

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
                data.docs.map(serial => ({
                    ...serial,
                    poster: serial.poster ? serial.poster.previewUrl : null,
                    watch_url: `http://127.0.0.1:8000/v/player?id=${serial.id}`
                })) :
                data;
            shuffleArray(results); // Перемешиваем результаты
            setSeries(results.filter(serial => serial.name && serial.poster && (serial.shortDescription || serial.description)));
            setIsLoading(false);  // Выключение индикатора загрузки
        })
        .catch(error => {
            console.error('Ошибка при поиске сериалов:', error);
            setIsLoading(false);  // Выключение индикатора загрузки в случае ошибки
        });
    }, [year, genre, country, rating, apiKey]);

    useEffect(() => {
        fetchSeries();
    }, [fetchSeries]);

    const handleMovieClick = (id) => {
        setActiveSection({ section: 'player', params: { movieId: id } });
    };

    const resetFilters = () => {
        setYear('');
        setRating('');
        setGenre('');
        setCountry('');
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
            {isLoading ? (
                <Loading /> // Отображение компонента загрузки
            ) : (
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
                        <select value={genre} onChange={e => setGenre(e.target.value)}>
                            <option value="">Жанр</option>
                            {genres.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <select value={country} onChange={e => setCountry(e.target.value)}>
                            <option value="">Страна</option>
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button onClick={resetFilters}>Сбросить фильтры</button>
                    </div>
                    <div className="popular-movie">
                        <h2>{isFiltered ? "Сериалы по вашим критериям" : "Популярные сериалы"}</h2>
                    </div>
                    <div className="movies-section">
                        {series.map(seria => (
                            seria.poster && (
                                <div onClick={() => handleMovieClick(seria.id)} key={seria.id} className="movie">
                                    <img src={seria.poster} alt={seria.name} className="movie-poster"/>
                                    <div className="movie-overlay">
                                        <i className="fa-solid fa-play play-icon"></i>
                                        <div className="movie-info">
                                            <div className="movie-title">{seria.name}</div>
                                            <div className="movie-description">{seria.shortDescription || seria.description}</div>
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

Series.propTypes = {
    setActiveSection: PropTypes.func.isRequired,
};