import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useWebSocket from 'react-use-websocket';
import './SharedPlayer.css';

export default function SharedPlayer() {
    const apiKey = import.meta.env.VITE_API_KEY;
    const apiKeyAlloha = import.meta.env.VITE_ALLOHA;
    const cdnApi = import.meta.env.VITE_DOMAIN;

    const { roomId } = useParams();
    console.log('roomId:', roomId);
    const [movie, setMovie] = useState(null);
    const [movieId, setMovieId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const playerRef = useRef(null);
    const scriptLoaded = useRef(false);

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    const { sendMessage } = useWebSocket(`ws://localhost:8000/ws/${roomId}`, {
        onOpen: () => console.log('WebSocket connection established'),
        onMessage: (message) => handleWebSocketMessage(message),
        onClose: () => console.log('WebSocket connection closed')
    });

    useEffect(() => {
        setIsLoading(true);
        const fetchRoomData = async () => {
            try {
                console.log(`Fetching room data for roomId: ${roomId}`);
                const roomResponse = await axios.get(`http://127.0.0.1:8000/api/v2/room/${roomId}`, {
                    headers: { 'accept': 'application/json' }
                });
                console.log('Room response:', roomResponse.data);
                const movieId = roomResponse.data.movieId;

                const movieIdInt = parseInt(movieId, 10);
                if (isNaN(movieIdInt)) {
                    throw new Error(`Invalid movieId: ${movieId}`);
                }

                setMovieId(movieIdInt);

                const movieResponse = await axios.get(`https://api.kinopoisk.dev/v1.4/movie/${movieIdInt}`, {
                    headers: { 'accept': 'application/json', 'X-API-KEY': apiKey }
                });
                console.log('Movie response:', movieResponse.data);
                setMovie(movieResponse.data);
            } catch (err) {
                setError(`Ошибка при получении данных фильма: ${err}`);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomData();
    }, [roomId, apiKey]);

    useEffect(() => {
        if (movie && !scriptLoaded.current) {
            const script = document.createElement('script');
            script.src = "https://kinobox.tv/kinobox.min.js";
            script.async = true;
            script.onload = () => {
                scriptLoaded.current = true;
                if (playerRef.current && window.kbox) {
                    initializePlayer(movieId);
                }
            };
            document.body.appendChild(script);
        } else if (movie && scriptLoaded.current && playerRef.current && window.kbox) {
            initializePlayer(movieId);
        }
    }, [movie, movieId]);

    const initializePlayer = (movieId) => {
        if (playerRef.current && movieId && window.kbox) {
            const playerInstance = window.kbox(playerRef.current, {
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

            // Проверка, создан ли playerInstance
            if (playerInstance) {
                // Добавление слушателей событий для воспроизведения и паузы
                playerInstance.addEventListener('play', handlePlay);
                playerInstance.addEventListener('pause', handlePause);
            } else {
                console.error("Player instance is undefined.");
            }
        } else {
            console.error("Player reference or movieId or window.kbox is undefined.");
        }
    };

    const handleWebSocketMessage = (message) => {
        const parsedMessage = JSON.parse(message.data);
        if (parsedMessage.type === 'chat') {
            setMessages((prevMessages) => [...prevMessages, parsedMessage.message]);
        } else if (parsedMessage.type === 'sync') {
            // Обработка синхронизации времени воспроизведения
            if (playerRef.current) {
                playerRef.current.currentTime = parsedMessage.time;
                if (parsedMessage.action === 'play') {
                    playerRef.current.play();
                } else if (parsedMessage.action === 'pause') {
                    playerRef.current.pause();
                }
            }
        }
    };

    const handleSendMessage = () => {
        if (message.trim()) {
            sendMessage(JSON.stringify({ type: 'chat', message }));
            setMessage('');
        }
    };

    const handlePlay = () => {
        sendMessage(JSON.stringify({ type: 'sync', action: 'play', time: playerRef.current.currentTime }));
    };

    const handlePause = () => {
        sendMessage(JSON.stringify({ type: 'sync', action: 'pause', time: playerRef.current.currentTime }));
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (isLoading || !movie) {
        return <div>Loading...</div>;
    }

    return (
        <div className="shared-player-container">
            <div className="movie-details">
                <img src={movie.poster.previewUrl} alt={movie.name} />
                <div>
                    <h2>{movie.name}</h2>
                    <p>{movie.description}</p>
                </div>
            </div>
            <div ref={playerRef} className="kinobox_player"></div>
            <div className="chat-container">
                <div className="messages">
                    {messages.map((msg, index) => (
                        <div key={index} className="message">{msg}</div>
                    ))}
                </div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
}
