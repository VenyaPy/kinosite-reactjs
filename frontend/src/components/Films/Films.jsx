import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Добавляем useNavigate
import axios from 'axios';
import "./Films.css";
import { motion } from "framer-motion";
import Loading from "../Loading/Loading.jsx";

export default function Films() {
    const apiKey = import.meta.env.VITE_API_KEY;
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [year, setYear] = useState('');
    const [rating, setRating] = useState('');
    const [genre, setGenre] = useState('');
    const [country, setCountry] = useState('');
    const [studio, setStudio] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const years = Array.from({ length: 45 }, (_, i) => 2024 - i);
    const ratings = ["1-3", "3-5", "5-7", "7-10"];
    const genres = ["драма", "комедия", "мелодрама", "ужасы", "фэнтези", "боевик", "семейный", "приключения", "детектив", "триллер", "фантастика", "документальный", "биография", "для взрослых", "короткометражка", "криминал"];
    const countries = ["США", "Великобритания", "Франция", "Германия", "Италия", "Канада", "Австралия", "Индия", "Япония", "Южная Корея", "Испания", "Россия", "Китай", "Швеция", "Бразилия"];
    const studios = ["Netflix", "HBO", "Disney+", "KION", "Paramount+", "Premier", "Amazon Prime Video"];

    const fetchMovies = useCallback(() => {
        setIsLoading(true);
        let filtersApplied = year || rating || genre || country || studio;
        setIsFiltered(filtersApplied);
        let url = filtersApplied ?
            `https://api.kinopoisk.dev/v1.4/movie?page=1&limit=250&type=movie` :
            `http://127.0.0.1:8000/api/v2/mainss`;

        if (year) url += `&year=${year}`;
        if (rating) url += `&rating.imdb=${rating}`;
        if (genre) url += `&genres.name=${encodeURIComponent(genre)}`;
        if (country) url += `&countries.name=${encodeURIComponent(country)}`;
        if (studio) url += `&networks.items.name=${encodeURIComponent(studio)}`;

        axios.get(url, {
            headers: { 'accept': 'application/json', 'X-API-KEY': apiKey }
        }).then(response => {
            const results = url.includes("kinopoisk.dev") ?
                response.data.docs.map(movie => ({
                    ...movie,
                    poster: movie.poster ? movie.poster.previewUrl : null
                })) :
                response.data;
            setMovies(results.slice(0, 250).filter(movie => movie.name && movie.poster && (movie.shortDescription || movie.description)));
            setIsLoading(false);
        }).catch(error => {
            console.error('Error fetching movies:', error);
            setIsLoading(false);
        });
    }, [year, genre, country, rating, studio, apiKey]);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    const handleMovieClick = (id) => {
        navigate(`/player/${id}`);
    };

    const resetFilters = () => {
        setYear('');
        setRating('');
        setGenre('');
        setCountry('');
        setStudio('');
        setIsFiltered(false);
        fetchMovies();
    };

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 1}}
            className="projects-container"
        >
            {isLoading ? (
                <Loading />
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
                        <select value={studio} onChange={e => setStudio(e.target.value)}>  // Добавлен новый фильтр
                            <option value="">Студия</option>
                            {studios.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={resetFilters}>Сбросить фильтры</button>
                    </div>
                    <div className="popular-movie">
                        <h2>{isFiltered ? "Фильмы по вашим критериям" : "Популярные фильмы"}</h2>
                    </div>
                    <div className="movies-section">
                        {movies.map(movie => (
                            movie.poster && (
                                <div onClick={() => handleMovieClick(movie.id)} key={movie.id} className="movie">
                                    <img src={movie.poster} alt={movie.name} className="movie-poster"/>
                                    <div className="movie-overlay">
                                        <i className="fa-solid fa-play play-icon"></i>
                                        <div className="movie-info">
                                            <div className="movie-title">{movie.name}</div>
                                            <div className="movie-description">{movie.shortDescription || movie.description}</div>
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
