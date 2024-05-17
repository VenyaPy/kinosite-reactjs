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

    useEffect(() => {
        setIsLoading(true);
        const fetchRoomData = async () => {
            try {
                const roomResponse = await axios.get(`http://127.0.0.1:8000/api/v2/room/${roomId}`, {
                    headers: { 'accept': 'application/json' }
                });
                const movieId = roomResponse.data.movieId;
                const movieIdInt = parseInt(movieId, 10);
                if (isNaN(movieIdInt)) {
                    throw new Error(`Invalid movieId: ${movieId}`);
                }
                setMovieId(movieIdInt);
                const movieResponse = await axios.get(`https://api.kinopoisk.dev/v1.4/movie/${movieIdInt}`, {
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
        if (movie && window.kbox) {
            initializePlayer(movieId);
        }
    }, [movie]);

    useEffect(() => {
        const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${roomId}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Connected to WebSocket');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
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

    const handlePlay = () => {
        if (wsRef.current && playerInstance.current) {
            wsRef.current.send(JSON.stringify({ type: 'sync', action: 'play', time: playerInstance.current.api('time') }));
        }
    };

    const handlePause = () => {
        if (wsRef.current && playerInstance.current) {
            wsRef.current.send(JSON.stringify({ type: 'sync', action: 'pause', time: playerInstance.current.api('time') }));
        }
    };

    const handleSeek = (time) => {
        if (wsRef.current && playerInstance.current) {
            wsRef.current.send(JSON.stringify({ type: 'sync', action: 'seek', time }));
        }
    };

    const handleSyncAction = (data) => {
        if (playerInstance.current) {
            if (data.action === 'play') {
                playerInstance.current.api('seek', data.time);
                playerInstance.current.api('play');
            } else if (data.action === 'pause') {
                playerInstance.current.api('seek', data.time);
                playerInstance.current.api('pause');
            } else if (data.action === 'seek') {
                playerInstance.current.api('seek', data.time);
            }
        }
    };

    const initializePlayer = (movieId) => {
        if (playerRef.current && movieId && window.kbox) {
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
                }
            });

            if (playerInstance.current) {
                playerInstance.current.api('play');
                playerInstance.current.addEventListener('play', handlePlay);
                playerInstance.current.addEventListener('pause', handlePause);
                playerInstance.current.addEventListener('seeked', handleSeek);
            } else {
                console.error("Player instance is undefined.");
            }
        } else {
            console.error("Player reference or movieId or window.kbox is undefined.");
        }
    };

    const handleSendMessage = () => {
        if (wsRef.current && message.trim()) {
            wsRef.current.send(JSON.stringify({ type: 'chat', message }));
            setMessage('');
        }
    };

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
                </div>
            </div>
            <div ref={playerRef} className="shared-player-kinobox_player"></div>
            <InviteLink roomId={roomId} />
            <div className="shared-player-chat-container">
                <div className="shared-player-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className="shared-player-message">{msg.message}</div>
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
