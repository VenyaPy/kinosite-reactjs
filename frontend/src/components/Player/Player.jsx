import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "./Player.css";
import Loading from "../Loading/Loading.jsx";
import parse from 'html-react-parser';
import Share from "../Share/Share.jsx";

export default function Player() {
    const apiKeyAlloha = import.meta.env.VITE_ALLOHA;
    const cdnApi = import.meta.env.VITE_DOMAIN;

    const { movieId } = useParams();
    const apiKey = import.meta.env.VITE_API_KEY;
    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const playerRef = useRef(null);
    const scriptLoaded = useRef(false);
    const navigate = useNavigate(); // Используйте useNavigate

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchUserProfile(token);
        }
    }, []);

    const fetchUserProfile = (token) => {
        axios.get('http://127.0.0.1:8000/api/v2/users/profile', {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_timestamp');
        });
    };

    useEffect(() => {
        setIsLoading(true);
        const fetchMovieAndReviews = async () => {
            try {
                console.log('Fetching movie and reviews...');
                const movieResponse = await axios.get(`https://api.kinopoisk.dev/v1.4/movie/${movieId}`, {
                    headers: { 'accept': 'application/json', 'X-API-KEY': apiKey }
                });
                const reviewsResponse = await axios.get(`https://api.kinopoisk.dev/v1.4/review?page=1&limit=20&movieId=${movieId}`, {
                    headers: { 'accept': 'application/json', 'X-API-KEY': apiKey }
                });
                setMovie(movieResponse.data);
                setReviews(reviewsResponse.data.docs.map(review => ({ ...review, isOpen: false })));
            } catch (err) {
                setError(`Ошибка при получении данных фильма: ${err}`);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovieAndReviews();
    }, [movieId, apiKey]);

    useEffect(() => {
        if (movie && !scriptLoaded.current) {
            console.log('Loading Kinobox script...');
            const script = document.createElement('script');
            script.src = "https://kinobox.tv/kinobox.min.js";
            script.async = true;
            script.onload = () => {
                scriptLoaded.current = true;
                if (playerRef.current) {
                    initializePlayer(movieId);
                }
                console.log('Kinobox script loaded.');
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
                    alloha: { token: apiKeyAlloha },
                    cdnmovies: { fallback: true, domain: cdnApi },
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

    const handleSharedView = () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            axios.post('http://127.0.0.1:8000/room/create_room', { movieId }, {
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                const roomId = response.data.message;
                navigate(`/shared/${roomId}`);
            })
            .catch(error => {
                console.error('Error creating room:', error);
            });
        } else {
            console.error('User not authenticated');
        }
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
            <button onClick={handleSharedView}>Совместный просмотр</button>
            <Share/>
            {reviews.length > 0 && (
                <div className="reviews-container">
                    <h3 className="review-text">Отзывы:</h3>
                    {reviews.map((review, index) => (
                        <div key={review.id} className={`review ${review.isOpen ? 'open' : ''}`}>
                            <div className="review-header">
                                <span className="review-author">{review.author}</span>
                                <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                            </div>
                            <p>{review.isOpen ? parse(review.review) : parse(`${review.review.substring(0, 200)}...`)}</p>
                            <button className="toggle-button" onClick={() => toggleReviewVisibility(index)}>
                                {review.isOpen ? 'Свернуть' : 'Развернуть отзыв'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
