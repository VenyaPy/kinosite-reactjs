import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './SharedPlayer.css';
import InviteLink from "../InviteLink/InviteLink.jsx";

export default function SharedPlayer() {
    const apiKeyAlloha = import.meta.env.VITE_ALLOHA;
    const cdnApi = import.meta.env.VITE_DOMAIN;
    const apiKey = import.meta.env.VITE_API_KEY;

    const { roomId } = useParams();
    const [movie, setMovie] = useState(null);
    const [movieId, setMovieId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const playerRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);

    const wsRef = useRef(null);
    const playerInstance = useRef(null);

    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await axios.get('http://127.0.0.1:8000/api/v2/users/profile', {
                        headers: {
                            'accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setUsername(response.data.username);
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                }
            }
        };

        fetchUserProfile();
    }, []);

    useEffect(() => {
        const fetchRoomData = async () => {
            setIsLoading(true);
            try {
                const roomResponse = await axios.get(`http://127.0.0.1:8000/api/v2/room/${roomId}`, {
                    headers: { 'accept': 'application/json' }
                });
                const movieId = roomResponse.data.movieId;
                setMovieId(movieId);
                const movieResponse = await axios.get(`https://api.kinopoisk.dev/v1.4/movie/${movieId}`, {
                    headers: { 'accept': 'application/json', 'X-API-KEY': apiKey }
                });
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
        if (movie && movieId) {
            loadKinoboxScript();
        }
    }, [movie, movieId]);

    const loadKinoboxScript = () => {
        if (!window.kbox) {
            const script = document.createElement('script');
            script.src = "https://kinobox.tv/kinobox.min.js";
            script.async = true;
            script.onload = () => {
                console.log('Kinobox script loaded');
                initializePlayer();
            };
            script.onerror = () => {
                console.error('Kinobox script failed to load');
            };
            document.body.appendChild(script);
        } else {
            initializePlayer();
        }
    };

    const initializePlayer = () => {
        if (playerRef.current && movieId && window.kbox) {
            console.log(`Initializing player with movieId: ${movieId}`);
            playerInstance.current = window.kbox(playerRef.current, {
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
                },
                vast: {
                    skip: true,  // Отключение рекламы
                }
            });

            if (playerInstance.current) {
                playerInstance.current.api('play');
                initializeIframeListeners();
            } else {
                console.error("Player instance is undefined.");
            }
        } else {
            console.error("Player reference, movieId, or window.kbox is undefined.");
        }
    };

    const initializeIframeListeners = () => {
        const iframe = playerRef.current.querySelector('iframe');
        if (iframe) {
            iframe.addEventListener('load', () => {
                console.log('Iframe loaded');
                iframe.contentWindow.postMessage({ "api": "addEventListener", "event": "play" }, "*");
                iframe.contentWindow.postMessage({ "api": "addEventListener", "event": "pause" }, "*");
                iframe.contentWindow.postMessage({ "api": "addEventListener", "event": "seek" }, "*");
            });

            window.addEventListener("message", (event) => {
                if (event.origin !== "https://sansa.newplayjj.com:9443") {
                    return; // Ignore messages from other origins
                }
                const data = event.data;
                console.log(`Received message from iframe: ${JSON.stringify(data)}`);
                if (data.event === "play" || data.event === "pause" || data.event === "seek") {
                    console.log(`Received event: ${data.event}, time: ${data.answer}`);
                    wsRef.current.send(JSON.stringify({ type: 'sync', action: data.event, time: data.answer }));
                }
            });
        } else {
            console.error("Iframe not found inside playerRef.");
        }
    };

    useEffect(() => {
        const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${roomId}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Connected to WebSocket');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data); // Debug log
            if (data.type === 'chat') {
                setMessages((prevMessages) => [...prevMessages, data]);
            } else if (data.type === 'sync') {
                handleSyncAction(data);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket');
        };

        return () => {
            ws.close();
        };
    }, [roomId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSyncAction = (data) => {
        console.log('Handling sync action:', data); // Debug log
        const iframe = playerRef.current.querySelector('iframe');
        if (iframe) {
            if (data.action === 'play') {
                iframe.contentWindow.postMessage({ "api": "seek", "set": data.time }, "*");
                iframe.contentWindow.postMessage({ "api": "play" }, "*");
            } else if (data.action === 'pause') {
                iframe.contentWindow.postMessage({ "api": "seek", "set": data.time }, "*");
                iframe.contentWindow.postMessage({ "api": "pause" }, "*");
            } else if (data.action === 'seek') {
                iframe.contentWindow.postMessage({ "api": "seek", "set": data.time }, "*");
            } else if (data.action === 'sync-time') {
                iframe.contentWindow.postMessage({ "api": "seek", "set": data.time }, "*");
            }
        }
    };

    const handleSendMessage = () => {
        if (wsRef.current && message.trim()) {
            console.log('Sending chat message:', { username, message }); // Debug log
            wsRef.current.send(JSON.stringify({ type: 'chat', username, message }));
            setMessage('');
        }
    };

    const handleSyncTime = () => {
        if (wsRef.current && playerInstance.current) {
            const currentTime = playerInstance.current.api('time');
            console.log('Sending sync-time action with time:', currentTime); // Debug log
            wsRef.current.send(JSON.stringify({ type: 'sync', action: 'sync-time', time: currentTime }));
        }
    };

    useEffect(() => {
        if (playerRef.current) {
            const handleUserInteraction = (ev) => {
                console.log(`User ${ev.type} on player`, ev);
                wsRef.current.send(JSON.stringify({ type: 'sync', action: ev.type, time: Date.now() }));
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        playerRef.current.addEventListener('click', handleUserInteraction);
                        playerRef.current.addEventListener('dblclick', handleUserInteraction);
                        playerRef.current.addEventListener('touchstart', handleUserInteraction);
                    } else {
                        playerRef.current.removeEventListener('click', handleUserInteraction);
                        playerRef.current.removeEventListener('dblclick', handleUserInteraction);
                        playerRef.current.removeEventListener('touchstart', handleUserInteraction);
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(playerRef.current);

            return () => {
                observer.disconnect();
            };
        }
    }, []);

    if (error) {
        return <div>{error}</div>;
    }

    if (isLoading || !movie) {
        return <div>Loading...</div>;
    }

    return (
        <div className="shared-player-container">
            <div className="shared-player-movie-details">
                <img src={movie.poster.previewUrl} alt={movie.name} />
                <div>
                    <h2 className="shared-player-title">{movie.name}</h2>
                    <p className="shared-player-description">{movie.description}</p>
                    <p className="shared-player-info"><strong>Рейтинг:</strong> Кинопоиск - {movie.rating.kp}, IMDb - {movie.rating.imdb}</p>
                    {movie.movieLength && <p className="shared-player-info"><strong>Длина:</strong> {movie.movieLength} минут</p>}
                    <p className="shared-player-info"><strong>Жанр:</strong> {movie.genres.map(genre => genre.name).join(', ')}</p>
                    <p className="shared-player-info"><strong>Страна:</strong> {movie.countries.map(country => country.name).join(', ')}</p>
                    <InviteLink roomId={roomId} />
                </div>
            </div>
            <div ref={playerRef} className="kinobox_player" data-kinobox="auto" data-kinopoisk={movieId}></div>
            <button onClick={handleSyncTime} className="sync-button">Синхронизировать время</button>
            <div className="shared-player-chat-container">
                <div className="shared-player-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className="shared-player-message"><strong>{msg.username}:</strong> {msg.message}</div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="shared-player-input-container">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="shared-player-input"
                        placeholder="Type a message..."
                    />
                    <button onClick={handleSendMessage} className="shared-player-button">Send</button>
                </div>
            </div>
        </div>
    );
}
