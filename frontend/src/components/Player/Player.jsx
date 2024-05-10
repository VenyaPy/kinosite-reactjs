import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PropTypes from "prop-types";
import "./Player.css";

function Player({ movieId }) {
    const apiKey = import.meta.env.VITE_API_KEY;

    const [movie, setMovie] = useState(null);
    const [error, setError] = useState('');
    const playerRef = useRef(null);
    const scriptLoaded = useRef(false);

    useEffect(() => {
        if (movieId) {
            const fetchMovie = async () => {
                try {
                    const response = await axios.get(`https://api.kinopoisk.dev/v1.4/movie/${movieId}`, {
                        headers: { 'accept': 'application/json', 'X-API-KEY': apiKey }
                    });
                    setMovie(response.data);
                } catch (err) {
                    setError('Ошибка при получении данных фильма');
                    console.error(err);
                }
            };

            fetchMovie();
        }
    }, [movieId]);

    useEffect(() => {
        if (movie && !scriptLoaded.current) {
            const script = document.createElement('script');
            script.src = "https://kinobox.tv/kinobox.min.js";
            script.onload = () => {
                scriptLoaded.current = true;
                if (playerRef.current) {
                    initializePlayer(movieId);  // Используйте movieId непосредственно
                }
            };
            document.body.appendChild(script);
        } else if (movie && scriptLoaded.current) {
            if (playerRef.current) {
                initializePlayer(movieId);
            }
        }
    }, [movie, movieId]);

    const initializePlayer = (movieId) => {
        if (playerRef.current && movieId) {
            window.kbox(playerRef.current, {
                search: {
                    kinopoisk: movieId,
                },
                menu: { enable: false },
                players: {
                    alloha: { enable: true, position: 1, domain: 'https://sansa.newplayjj.com:9443' },
                    videocdn: { enable: true, position: 2, domain: 'https://12537.svetacdn.in/gzIOdW6ZBYvH' },
                    kodik: { enable: true, position: 3, domain: 'https://kodik.info/video/3007/d11f14905f287e1939c1875dc2ab9c6f/720p' }  // Добавлен третий плеер
                },
                params: {
                    alloha: { token: '3a4e69a3bb3a0eb3b5bf5eba7e563b' },
                    videocdn: { fallback: true },
                    kodik: { fallback: true }  // Включение автоматического переключения на Kodik, если другие не работают
                }
            });
        } else {
            console.error("Player reference or movieId is undefined.");
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!movie) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="player-container">
            <div className="movie-details">
                <img src={movie.poster.url} alt={movie.name} />
                <div>
                    <h2>{movie.name}</h2>
                    <p>{movie.description}</p>
                </div>
            </div>
            <div ref={playerRef} className="kinobox_player"></div> {/* Место для плеера */}
        </div>
    );
}

Player.propTypes = {
    movieId: PropTypes.string.isRequired,
};

export default Player;

