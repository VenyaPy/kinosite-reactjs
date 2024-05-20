import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "./Player.css";
import Loading from "../Loading/Loading.jsx";
import parse from 'html-react-parser';
import { motion } from "framer-motion";

export default function Player() {
    const apiKeyAlloha = import.meta.env.VITE_ALLOHA;
    const cdnApi = import.meta.env.VITE_DOMAIN;
    const apiKey = import.meta.env.VITE_API_KEY;

    const { movieId } = useParams();
    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const [isSwiped, setIsSwiped] = useState(false);
    const playerRef = useRef(null);
    const scriptLoaded = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchUserProfile(token);
        } else {
            setUserId(null);
        }
    }, []);

    const fetchUserProfile = (token) => {
        axios.get('http://127.0.0.1:8000/api/v2/users/profile', {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.data.id) {
                setUserId(response.data.id);
            }
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_timestamp');
            setUserId(null);
        });
    };

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
                if (userId) {
                    sendMovieToHistory(userId, movieResponse.data);
                }
            } catch (err) {
                setError(`Ошибка при получении данных фильма: ${err}`);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovieAndReviews();
    }, [movieId, apiKey, userId]);

    const sendMovieToHistory = (userId, movie) => {
        axios.post(`http://127.0.0.1:8000/api/v2/history/move_history`, null, {
            params: {
                id_user: userId,
                id_film: movie.id,
                name: movie.name,
                description: movie.description,
                poster_url: movie.poster.previewUrl
            },
            headers: {
                'accept': 'application/json'
            }
        })
        .catch(error => {
            console.error('Error sending movie to history:', error);
        });
    };

    useEffect(() => {
        if (movie && !scriptLoaded.current) {
            const script = document.createElement('script');
            script.src = "https://kinobox.tv/kinobox.min.js";
            script.async = true;
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

    const handleSwipe = () => {
        setIsSwiped(true);
        setTimeout(() => {
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
                    setIsSwiped(false); // Возвращаем положение кнопки в начальное состояние при ошибке
                });
            } else {
                alert('Вам нужно войти в аккаунт, чтобы использовать функцию совместного просмотра');
                setIsSwiped(false); // Возвращаем положение кнопки в начальное состояние при ошибке
            }
        }, 1000);
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!movie || isLoading) {
        return <Loading />;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="projects-container"
        >
            <div className="player-container">
                <div className="movie-details">
                    <img src={movie.poster.previewUrl} alt={movie.name} />
                    <div>
                        <h2>{movie.name}</h2>
                        <p>{movie.description}</p>
                        <p className="p-m"><strong>Рейтинг:</strong> Кинопоиск - {movie.rating.kp}, IMDb - {movie.rating.imdb}</p>
                        {movie.movieLength && <p className="p-m"><strong>Длина:</strong> {movie.movieLength} минут</p>}
                        <p className="p-m"><strong>Жанр:</strong> {movie.genres.map(genre => genre.name).join(', ')}</p>
                        <p className="p-m"><strong>Страна:</strong> {movie.countries.map(country => country.name).join(', ')}</p>
                    </div>
                </div>
                <div ref={playerRef} className="kinobox_player"></div>
                <div className="switch-container">
                    <span className="switch-label">Включить совместный просмотр</span>
                    <motion.label className="switch">
                        <input
                            type="checkbox"
                            checked={isSwiped}
                            onChange={handleSwipe}
                            style={{ display: 'none' }}
                        />
                        <motion.div className="switch-inner">
                            <motion.div
                                className="switch-thumb"
                                animate={{x: isSwiped ? 23 : 0}}
                                transition={{duration: 0.6}}
                            />
                        </motion.div>
                    </motion.label>
                </div>
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
        </motion.div>
    );
}
