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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const playerRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const wsRef = useRef(null);
    const [username, setUsername] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await axios.get('/api/v2/users/profile', {
                        headers: {
                            'accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setUsername(response.data.username);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error('Ошибка при получении профиля пользователя:', err);
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        };

        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            const joinRoom = async () => {
                const token = localStorage.getItem('access_token');
                if (token) {
                    try {
                        await axios.post(`/api/v2/room/join_room/${roomId}`, {}, {
                            headers: {
                                'accept': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        });
                    } catch (err) {
                        console.error('Ошибка при присоединении к комнате:', err);
                    }
                }
            };

            const fetchRoomData = async () => {
                setIsLoading(true);
                try {
                    const roomResponse = await axios.get(`/api/v2/room/${roomId}`, {
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
                console.log('Скрипт Kinobox загружен');
                initializePlayer(movieId);
            };
            script.onerror = () => {
                console.error('Не удалось загрузить скрипт Kinobox');
            };
            document.body.appendChild(script);
        } else {
            initializePlayer(movieId);
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
                    kodik: {
                        enable: true,
                        position: 4,
                        domain: 'https://kodik.info/video/3007/d11f14905f287e1939c1875dc2ab9c6f/720p'
                    },
                    collaps: { enable: true, position: 2, domain: `https://api.delivembd.ws/embed/kp/${movieId}` }
                },
                params: {
                    alloha: { token: apiKeyAlloha },
                    cdnmovies: { fallback: true, domain: cdnApi },
                    kodik: { fallback: true },
                    collaps: { fallback: true },
                }
            });

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
                        console.log('Кнопка синхронизации нажата');
                        iframe.contentWindow.postMessage({ api: 'time' }, "*");
                        window.addEventListener('message', function handleTimeResponse(event) {
                            if (event.data && event.data.event === 'time') {
                                const currentTime = event.data.answer;
                                console.log('Текущее время воспроизведения:', currentTime);
                                if (wsRef.current) {
                                    wsRef.current.send(JSON.stringify({
                                        type: 'control',
                                        command: `play:url[seek:${currentTime}]`
                                    }));
                                    console.log('Сообщение о синхронизации отправлено через WebSocket');
                                }
                                window.removeEventListener('message', handleTimeResponse);
                            }
                        });
                    });
                }
            }, 1000);
        } else {
            console.error("Player reference или movieId не определены.");
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            const ws = new WebSocket(`wss://${window.location.host}/ws/${roomId}`);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('Подключено к WebSocket');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('Сообщение WebSocket получено:', data);
                if (data.type === 'chat') {
                    setMessages((prevMessages) => [...prevMessages, data]);
                } else if (data.type === 'notification') {
                    setMessages((prevMessages) => [...prevMessages, { username: "Комната", message: data.message }]);
                    if (data.message.includes('вошел')) {
                        setUsers((prevUsers) => [...prevUsers, data.username]);
                    } else if (data.message.includes('вышел')) {
                        setUsers((prevUsers) => prevUsers.filter(user => user !== data.username));
                    }
                } else if (data.type === 'control') {
                    handleControlMessage(data.command);
                } else if (data.type === 'movie') {
                    setMovieId(data.movieId);
                    fetchMovieData(data.movieId);
                }
            };

            ws.onclose = () => {
                console.log('Отключено от WebSocket');
            };

            return () => {
                ws.close();
            };
        }
    }, [roomId, isAuthenticated, username]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        if (wsRef.current && message.trim()) {
            console.log('Отправка сообщения в чат:', { username, message });
            wsRef.current.send(JSON.stringify({ type: 'chat', username, message }));
            setMessage('');
        }
    };

    const handleControlMessage = (command) => {
        const iframe = document.querySelector('.kinobox_player iframe');
        if (iframe) {
            const match = command.match(/play:url\[seek:(\d+(\.\d+)?)\]/);
            if (match) {
                const time = match[1];
                console.log('Синхронизация на время:', time);
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
        // Пустая функция, если не требуется дополнительное поведение
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

    if (error) {
        return <div>{error}</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="auth-container-m">
                <div className="auth-message-m">
                    Для того чтобы смотреть фильмы с другом, войдите в аккаунт, и обновите страницу 🍿
                </div>
                <i className="fa-solid fa-rotate-right auth-image-m" onClick={() => window.location.reload()}></i>
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
                        <h5 className="use-text mobile-hide">Для совместного просмотра пользуйся кнопками. Приятного
                            просмотра 🍿</h5>
                        <p className="manual-text mobile-hide">
                            <span className="first-sentence">Кнопки совместного просмотра не поддерживаются некоторыми плеерами.</span><br/>
                            Сезоны и серии переключаются вручную.
                        </p>
                    </div>
                    <div className="shared-player-chat-container">
                        <InviteLink roomId={roomId}/>
                        <div className="shared-player-messages" style={{height: '800px'}}>
                            {messages.length === 0 ? (
                                <div className="no-messages">Пока тут нет сообщений. Напишите первое!</div>
                            ) : (
                                messages.map((msg, index) => (
                                    <div key={index} className="shared-player-message">
                                        <strong>{msg.username}:</strong> {msg.message}
                                    </div>
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
                            <button onClick={handleSendMessage} className="shared-player-button"><i
                                className="fa-solid fa-paper-plane"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
