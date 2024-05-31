import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "./Player.css";
import Loading from "../Loading/Loading.jsx";
import { motion } from "framer-motion";

export default function Player() {
    const apiKeyAlloha = import.meta.env.VITE_ALLOHA;
    const cdnApi = import.meta.env.VITE_DOMAIN;
    const apiKey = import.meta.env.VITE_API_KEY;

    const { movieId } = useParams();
    const [movie, setMovie] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const [isSwiped, setIsSwiped] = useState(false);
    const playerRef = useRef(null);
    const scriptLoaded = useRef(false);
    const navigate = useNavigate();

    const [reviewSubmitted, setReviewSubmitted] = useState(false)
    const [ratingCounts, setRatingCounts]  = useState({
        1: null,
        2: null,
        3: null,
        4: null,
        5: null
    })

    const submitRating = async (movieId, score) => {
        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/v2/review`, null, {
                params: {
                    movie_id: movieId,
                    score: score
                }
            });
            console.log('Оценка отправлена:', response.data);
            await fetchRatingCounts(movieId); // Обновление рейтингов после отправки оценки
        } catch (error) {
            console.error('Ошибка при отправке комментария:', error);
        }
    };

    const fetchRatingCounts = async (movieId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/v2/get_review`, {
                params: { movie_id: movieId }
            });
            if (response.data && response.data.movie_id) {
                setRatingCounts({
                    1: response.data.rating_1 || null,
                    2: response.data.rating_2 || null,
                    3: response.data.rating_3 || null,
                    4: response.data.rating_4 || null,
                    5: response.data.rating_5 || null
                });
            } else {
                setRatingCounts({
                    1: null,
                    2: null,
                    3: null,
                    4: null,
                    5: null
                });
            }
        } catch (error) {
            console.error('Ошибка при получении оценок:', error);
            setRatingCounts({
                1: null,
                2: null,
                3: null,
                4: null,
                5: null
            });
        }
    };

    useEffect(() => {
        if (movieId) {
            fetchRatingCounts(movieId);
        }
    }, [movieId])


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


    const handleReviewClick = (rating) => {
        submitRating(movieId, rating);
        setReviewSubmitted(true);
    };

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
                setMovie(movieResponse.data);
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
                <div>
                    {reviewSubmitted ? (
                            <div className="thank-you-message">
                                Спасибо за ваш отзыв!
                            </div>
                        ) : (
                        <div className="review-container-uni">
                            <h3 className="review-text-uni">Понравился ли вам фильм?</h3>
                                <div className="emoji-rating">
                                    <div className="emoji-container" onClick={() => handleReviewClick(1)}>
                                        <span className="emoji" data-rating="1">😢</span>
                                        <span className="rating-count">{ratingCounts[1]}</span>
                                    </div>
                                    <div className="emoji-container" onClick={() => handleReviewClick(2)}>
                                        <span className="emoji" data-rating="2">😟</span>
                                        <span className="rating-count">{ratingCounts[2]}</span>
                                    </div>
                                    <div className="emoji-container" onClick={() => handleReviewClick(3)}>
                                        <span className="emoji" data-rating="3">😐</span>
                                        <span className="rating-count">{ratingCounts[3]}</span>
                                    </div>
                                    <div className="emoji-container" onClick={() => handleReviewClick(4)}>
                                        <span className="emoji" data-rating="4">🙂</span>
                                        <span className="rating-count">{ratingCounts[4]}</span>
                                    </div>
                                    <div className="emoji-container" onClick={() => handleReviewClick(5)}>
                                        <span className="emoji" data-rating="5">😃</span>
                                        <span className="rating-count">{ratingCounts[5]}</span>
                                    </div>
                                </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
