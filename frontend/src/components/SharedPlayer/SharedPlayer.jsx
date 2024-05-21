import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './SharedPlayer.css';
import { motion } from "framer-motion";
import InviteLink from "../InviteLink/InviteLink.jsx";
import Loading from "../Loading/Loading.jsx";

export default function SharedPlayer() {
    const apiKeyAlloha = import.meta.env.VITE_ALLOHA;
    const cdnApi = import.meta.env.VITE_DOMAIN;
    const apiKey = import.meta.env.VITE_API_KEY;

    const { roomId } = useParams();
    const [movie, setMovie] = useState(null);
    const [movieId, setMovieId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Новое состояние для отслеживания авторизации
    const playerRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const wsRef = useRef(null);
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
                    setIsAuthenticated(true); // Пользователь авторизован
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        };

        fetchUserProfile();
    }, []);

    const joinRoom = async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                await axios.post(`http://127.0.0.1:8000/api/v2/room/join_room/${roomId}`, {}, {
                    headers: {
                        'accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (err) {
                console.error('Error joining room:', err);
            }
        }
    };

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

    useEffect(() => {
        if (isAuthenticated) {
            joinRoom();
            fetchRoomData();
        }
    }, [isAuthenticated, roomId, apiKey]);

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
                initializePlayer(movieId); // Передаем movieId
            };
            script.onerror = () => {
                console.error('Kinobox script failed to load');
            };
            document.body.appendChild(script);
        } else {
            initializePlayer(movieId); // Передаем movieId
        }
    };

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

            // Добавим небольшой таймаут для ожидания создания iframe
            setTimeout(() => {
                const iframe = document.querySelector('.kinobox_player iframe');
                if (iframe) {
                    document.getElementById('play').addEventListener('click', () => {
                        sendControlMessage('play');
                    });

                    document.getElementById('pause').addEventListener('click', () => {
                        sendControlMessage('pause');
                    });

                    document.getElementById('sync').addEventListener('click', () => {
                        console.log('Sync button clicked');
                        iframe.contentWindow.postMessage({ api: 'time' }, "*");
                        window.addEventListener('message', function handleTimeResponse(event) {
                            if (event.data && event.data.event === 'time') {
                                const currentTime = event.data.answer; // Use the correct field for the time
                                console.log('Current playback time:', currentTime);
                                if (wsRef.current) {
                                    wsRef.current.send(JSON.stringify({ type: 'control', command: `play:url[seek:${currentTime}]` }));
                                    console.log('Sync message sent via WebSocket');
                                }
                                window.removeEventListener('message', handleTimeResponse); // Clean up listener
                            }
                        });
                    });
                }
            }, 1000);
        } else {
            console.error("Player reference or movieId is undefined.");
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
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
                } else if (data.type === 'control') {
                    handleControlMessage(data.command);
                } else if (data.type === 'movie') {
                    setMovieId(data.movieId);
                    fetchMovieData(data.movieId);
                }
            };

            ws.onclose = () => {
                console.log('Disconnected from WebSocket');
            };

            return () => {
                ws.close();
            };
        }
    }, [roomId, isAuthenticated]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        if (wsRef.current && message.trim()) {
            console.log('Sending chat message:', { username, message }); // Debug log
            wsRef.current.send(JSON.stringify({ type: 'chat', username, message }));
            setMessage('');
        }
    };

    const handleControlMessage = (command) => {
        const iframe = document.querySelector('.kinobox_player iframe'); // Получаем элемент iframe
        if (iframe) {
            const match = command.match(/play:url\[seek:(\d+(\.\d+)?)\]/);
            if (match) {
                const time = match[1];
                console.log('Syncing to time:', time);
                iframe.contentWindow.postMessage({ api: 'seek', time: time }, "*");
                iframe.contentWindow.postMessage({ api: 'play' }, "*");
            } else {
                iframe.contentWindow.postMessage({ api: command }, "*");
            }
        }
    };

    const sendControlMessage = (command) => {
        if (wsRef.current) {
            wsRef.current.send(JSON.stringify({ type: 'control', command }));
        }
        handleControlMessage(command);
    };

    const handleFocus = () => {
        inputRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    const handleInput = () => {
        // Empty function if you don't need additional behavior
    };

    const fetchMovieData = async (movieId) => {
        try {
            const movieResponse = await axios.get(`https://api.kinopoisk.dev/v1.4/movie/${movieId}`, {
                headers: { 'accept': 'application/json', 'X-API-KEY': apiKey }
            });
            setMovie(movieResponse.data);
            loadKinoboxScript();
        } catch (err) {
            setError(`Ошибка при получении данных фильма: ${err}`);
            console.error(err);
        }
    };

    const handleMovieSelection = (selectedMovieId) => {
        if (wsRef.current) {
            wsRef.current.send(JSON.stringify({ type: 'movie', movieId: selectedMovieId }));
        }
        setMovieId(selectedMovieId);
        fetchMovieData(selectedMovieId);
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="auth-message">
                Для того чтобы смотреть фильмы с другом, войдите в аккаунт, и обновите страницу 🍿
            </div>
        );
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
            <div className="shared-player-container">
                <div className="shared-player-content">
                    <div className="shared-player-kinobox">
                        <div ref={playerRef} className="kinobox_player" data-kinobox="auto"
                             data-kinopoisk={movieId}></div>
                        <div className="shared-player-controls">
                            <button id="play"><i className="fa-solid fa-play"></i></button>
                            <button id="pause"><i className="fa-solid fa-pause"></i></button>
                            <button id="sync">Синхронизировать</button>
                        </div>
                        <h5 className="use-text">Для совместного просмотра пользуйся кнопками. Приятного просмотра
                            🍿</h5>
                        <p className="manual-text">
                          <span className="first-sentence">Кнопки совместного просмотра не поддерживаются некоторыми плеерами.</span><br/>
                          Сезоны и серии переключаются вручную.
                                                </p>

                    </div>
                    <div className="shared-player-chat-container">
                        <InviteLink roomId={roomId}/>
                        <div className="shared-player-messages" style={{ height: '800px' }}>
                            {messages.length === 0 ? (
                                <div className="no-messages">Пока тут нет сообщений. Напиши первый!</div>
                            ) : (
                                messages.map((msg, index) => (
                                    <div key={index} className="shared-player-message"><strong>{msg.username}:</strong> {msg.message}</div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="shared-player-input-container">
                            <input
                                ref={inputRef}
                                type="text"
                                value={message}
                                onFocus={handleFocus}
                                onInput={handleInput}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                className="shared-player-input"
                                placeholder="Написать сообщение..."
                            />
                            <button onClick={handleSendMessage} className="shared-player-button"><i className="fa-solid fa-paper-plane"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
