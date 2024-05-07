import { useState, useEffect, useCallback } from 'react';
import './Films.css';

export default function Films() {
    const apiKey = process.env.REACT_APP_API_KEY;

    const [movies, setMovies] = useState([]);
    const [year, setYear] = useState('');
    const [rating, setRating] = useState('');
    const [genre, setGenre] = useState('');
    const [country, setCountry] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);

    const years = Array.from({length: 45}, (_, i) => 2024 - i);
    const ratings = Array.from({length: 10}, (_, i) => i + 1);
    const genres = ["драма", "комедия", "мелодрама", "ужасы", "фэнтези", "боевик", "приключения", "детектив", "триллер", "фантастика", "анимация", "документальный", "музыкальный", "биография", "история"];
    const countries = ["США", "Великобритания", "Франция", "Германия", "Италия", "Канада", "Австралия", "Индия", "Япония", "Южная Корея", "Испания", "Россия", "Китай", "Швеция", "Бразилия"];

    const fetchMovies = useCallback(() => {
        let filtersApplied = year || rating || genre || country;
        setIsFiltered(filtersApplied); // Обновляем состояние фильтрации
        let url = filtersApplied ?
            `https://api.kinopoisk.dev/v1.4/movie?page=1&limit=100&type=movie` :
            `http://127.0.0.1:8000/api/v2/films`;

        if (year) url += `&year=${year}`;
        if (rating) url += `&rating.kp=${rating}`;
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
                data.docs.map(movie => ({
                    ...movie,
                    poster: movie.poster ? movie.poster.url : null,
                    watch_url: `http://127.0.0.1:8000/v/player?id=${movie.id}`
                })) :
                data;
            setMovies(results.filter(movie => movie.name && movie.description && movie.poster));
        })
        .catch(error => console.error('Error fetching movies:', error));
    }, [year, genre, country, rating]);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    const resetFilters = () => {
        setYear('');
        setRating('');
        setGenre('');
        setCountry('');
        setIsFiltered(false);
        fetchMovies(); // Сброс и повторный запрос фильмов без фильтров
    };

    return (
        <div>
            <div className="filters">
                <select value={year} onChange={e => setYear(e.target.value)}>
                    <option value="">Год</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={rating} onChange={e => setRating(e.target.value)}>
                    <option value="">Рейтинг KP</option>
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
                <h2>{isFiltered ? "Фильмы по вашим критериям" : "Популярные фильмы"}</h2>
            </div>
            <div className="movies-section">
                {movies.map(movie => (
                    movie.poster && (
                        <a href={movie.watch_url} key={movie.id} className="movie">
                            <img src={movie.poster} alt={movie.name} className="movie-poster"/>
                            <div className="movie-overlay">
                                <i className="fa-solid fa-play play-icon"></i>
                                <div className="movie-info">
                                    <div className="movie-title">{movie.name}</div>
                                    <div className="movie-description">{movie.shortDescription}</div>
                                </div>
                            </div>
                        </a>
                    )
                ))}
            </div>
        </div>
    );
}