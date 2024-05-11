import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PropTypes from "prop-types";
import "./Player.css";
import Loading from "../Loading/Loading.jsx";
import parse from 'html-react-parser';



function Player({ movieId }) {
    const apiKey = import.meta.env.VITE_API_KEY;
    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const playerRef = useRef(null);
    const scriptLoaded = useRef(false);

    useEffect(() => {
        setIsLoading(true);
        const fetchMovieAndReviews = async () => {
            try {
                const movieResponse = await axios.get(`https://api.kinopoisk.dev/v1.4/movie/${movieId}`, {
                    headers: { 'accept': 'application/json', 'X-API-KEY': apiKey }
                });
                const reviewsResponse = await axios.get(`https://api.kinopoisk.dev/v1.4/review?page=1&limit=20&movieId=${movieId}`, {
                    headers: { 'accept': 'application/json', 'X-API-KEY': apiKey }
                });
                setMovie(movieResponse.data);
                setReviews(reviewsResponse.data.docs.map(review => ({ ...review, isOpen: false })));
            } catch (err) {
                setError('Ошибка при получении данных фильма');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovieAndReviews();
    }, [movieId]);

    useEffect(() => {
        if (movie && !scriptLoaded.current) {
            const script = document.createElement('script');
            script.src = "https://kinobox.tv/kinobox.min.js";
            script.onload = () => {
                scriptLoaded.current = true;
                if (playerRef.current) {
                    initializePlayer(movieId);
                }
            };
            document.body.appendChild(script);
        } else if (movie && scriptLoaded.current && playerRef.current) {
            initializePlayer(movieId);
        }
    }, [movie, movieId]);

    const initializePlayer = (movieId) => {
        if (playerRef.current && movieId) {
            window.kbox(playerRef.current, {
                search: { kinopoisk: movieId },
                menu: { enable: false },
                players: {
                    alloha: { enable: true, position: 1, domain: 'https://sansa.newplayjj.com:9443' },
                    cdnmovies: { enable: true, position: 3, domain: 'https://cdnmovies-stream.online' },
                    kodik: { enable: true, position: 4, domain: 'https://kodik.info/video/3007/d11f14905f287e1939c1875dc2ab9c6f/720p' },
                    collaps: { enable: true, position: 2, domain: `https://api.delivembd.ws/embed/kp/${movieId}` }
                },
                params: {
                    alloha: { token: '3a4e69a3bb3a0eb3b5bf5eba7e563b' },
                    cdnmovies: { fallback: true, domain: 'kinobox.tv' },
                    kodik: { fallback: true },
                    collaps: { fallback: true },
                }
            });
        } else {
            console.error("Player reference or movieId is undefined.");
        }
    };

    const toggleReviewVisibility = index => {
        const updatedReviews = reviews.map((review, i) => {
            if (i === index) {
                return { ...review, isOpen: !review.isOpen };
            }
            return review;
        });
        setReviews(updatedReviews);
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!movie || isLoading) {
        return <Loading />;
    }

    return (
        <div className="player-container">
            <div className="movie-details">
                <img src={movie.poster.previewUrl} alt={movie.name} />
                <div>
                    <h2>{movie.name}</h2>
                    <p>{movie.description}</p>
                    <p className="p-m">Рейтинг: Кинопоиск - {movie.rating.kp}, IMDb - {movie.rating.imdb}</p>
                    <p className="p-m">Длина: {movie.movieLength} минут</p>
                    <p className="p-m">Жанр: {movie.genres.map(genre => genre.name).join(', ')}</p>
                    <p className="p-m">Страна: {movie.countries.map(country => country.name).join(', ')}</p>
                </div>
            </div>
            <div ref={playerRef} className="kinobox_player"></div>
            <h3 className="review-text">Отзывы:</h3>
            {reviews.map((review, index) => (
                <div key={review.id} className={`review ${review.isOpen ? 'open' : ''}`}>
                    <p>{review.isOpen ? parse(review.review) : parse(`${review.review.substring(0, 200)}...`)}</p>
                    <div className="review-details">
                        <span>{review.author}</span>
                        <span>{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <button className="toggle-button" onClick={() => toggleReviewVisibility(index)}>
                        {review.isOpen ? 'Свернуть' : 'Развернуть отзыв'}
                    </button>
                </div>
            ))}
        </div>
    );
}

Player.propTypes = {
    movieId: PropTypes.string.isRequired,
};

export default Player;

