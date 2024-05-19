import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './SharedPlayer.css';
import InviteLink from "../InviteLink/InviteLink.jsx";

export default function SharedPlayer() {
    const apiKeyAlloha = import.meta.env.VITE_ALLOHA;
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
    const inputRef = useRef(null);
    const scrollPositionRef = useRef(0);

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
            window.kbox(playerRef.current, {
                search: { kinopoisk: movieId },
                menu: { enable: false },
                players: {
                    alloha: { enable: true, position: 1, domain: 'https://sansa.newplayjj.com:9443' }
                },
                params: {
                    alloha: { token: apiKeyAlloha }
                },
                vast: {
                    skip: true,  // Отключение рекламы
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
            console.error("Player reference, movieId, or window.kbox is undefined.");
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
            } else if (data.type === 'control') {
                handleControlMessage(data.command);
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

    if (error) {
        return <div>{error}</div>;
    }

    if (isLoading || !movie) {
        return <div>Loading...</div>;
    }

    return (
        <div className="shared-player-container">
            <div className="shared-player-content">
                <div className="shared-player-kinobox">
                    <div ref={playerRef} className="kinobox_player" data-kinobox="auto" data-kinopoisk={movieId}></div>
                    <div className="shared-player-controls">
                        <button id="play"><i className="fa-solid fa-play"></i></button>
                        <button id="pause"><i className="fa-solid fa-pause"></i></button>
                        <button id="sync">Синхронизировать</button>
                    </div>
                    <h5 className="use-text">Для совместного просмотра пользуйся кнопками. Приятного просмотра 🍿</h5>
                    <p className="manual-text">Переключение сезонов и серий работает только вручную</p>
                </div>
                <div className="shared-player-chat-container">
                    <InviteLink />
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
    );
}
