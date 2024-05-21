import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Youtube.css';
import { motion } from "framer-motion";
import InviteLink from "../InviteLink/InviteLink.jsx";
import Loading from "../Loading/Loading.jsx";

export default function Youtube() {
    const { roomId } = useParams();
    const [query, setQuery] = useState('');
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const wsRef = useRef(null);
    const playerRef = useRef(null);
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log("Fetching user profile...");
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
                    console.log("User profile fetched:", response.data);
                    setUsername(response.data.username);
                    setIsAuthenticated(true);
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

    useEffect(() => {
        if (isAuthenticated) {
            console.log("Connecting to WebSocket...");
            const ws = new WebSocket(`ws://127.0.0.1:8000/ws/yt/${roomId}`);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('Connected to WebSocket');
                if (selectedVideo) {
                    ws.send(JSON.stringify({ type: 'control', videoId: selectedVideo.id.videoId }));
                }
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('WebSocket message received:', data);
                if (data.type === 'chat') {
                    setMessages((prevMessages) => [...prevMessages, data]);
                } else if (data.type === 'control') {
                    if (data.videoId) {
                        handleControlMessage({ type: 'video', videoId: data.videoId });
                    }
                    if (data.command) {
                        handleControlMessage({ type: 'command', command: data.command });
                    }
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.onclose = () => {
                console.log('Disconnected from WebSocket');
            };

            return () => {
                ws.close();
            };
        }
    }, [isAuthenticated, roomId, selectedVideo]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const searchVideos = async () => {
        const apiKey = 'AIzaSyCv2HQx-pt-eq45aA1blGWTJskP9gxFcMk';
        setIsLoading(true);
        console.log("Searching videos for query:", query);
        try {
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'video',
                    maxResults: 50, // Запрашиваем 50 результатов
                    key: apiKey
                }
            });
            console.log("Videos fetched:", response.data.items);
            setVideos(response.data.items);
        } catch (err) {
            console.error('Error fetching YouTube videos:', err);
            setError('Ошибка при поиске видео.');
        } finally {
            setIsLoading(false);
        }
    };

    const selectVideo = (video) => {
        console.log("Video selected:", video);
        setSelectedVideo(video);
        setQuery('');  // Clear the search input
        setVideos([]); // Clear the search results
        if (wsRef.current) {
            wsRef.current.send(JSON.stringify({ type: 'control', videoId: video.id.videoId }));
            console.log('Sending control message with videoId:', video.id.videoId);
        }
        initializePlayer(`https://www.youtube.com/watch?v=${video.id.videoId}`);
    };

    const initializePlayer = (videoUrl) => {
        console.log("Initializing player with video URL:", videoUrl);
        const iframe = document.getElementById('player-iframe');
        if (iframe) {
            iframe.src = `/playerjs.html?file=${videoUrl}`;
        }
    };

    const handleSendMessage = () => {
        if (wsRef.current && message.trim()) {
            console.log('Sending chat message:', { username, message });
            wsRef.current.send(JSON.stringify({ type: 'chat', username, message }));
            setMessage('');
        }
    };

    const handlePlay = () => {
        console.log("Handle play clicked");
        sendControlMessage('play');
    };

    const handlePause = () => {
        console.log("Handle pause clicked");
        sendControlMessage('pause');
    };

    const handleSync = () => {
        console.log("Handle sync clicked");
        const iframe = document.getElementById('player-iframe');
        if (iframe) {
            console.log('Requesting current time from iframe');
            iframe.contentWindow.postMessage({ api: 'time' }, "*");
            window.addEventListener('message', function handleTimeResponse(event) {
                console.log("Time response received:", event.data);
                if (event.data && event.data.event === 'time') {
                    const currentTime = event.data.answer;
                    console.log('Current playback time:', currentTime);
                    if (wsRef.current) {
                        wsRef.current.send(JSON.stringify({ type: 'control', command: `seek:${currentTime}` }));
                        console.log('Sync message sent via WebSocket');
                    }
                    window.removeEventListener('message', handleTimeResponse);
                }
            });
        }
    };

    const sendControlMessage = (command) => {
        console.log("Sending control message:", command);
        if (wsRef.current) {
            wsRef.current.send(JSON.stringify({ type: 'control', command }));
            console.log('WebSocket control message sent:', command);
        }
        handleControlMessage({ type: 'command', command });
    };

    const handleControlMessage = (data) => {
        const iframe = document.getElementById('player-iframe');
        console.log("Handling control message:", data);
        if (iframe) {
            if (data.type === 'video') {
                console.log('Loading video:', data.videoId);
                iframe.src = `/playerjs.html?file=https://www.youtube.com/watch?v=${data.videoId}`;
            } else if (data.type === 'command') {
                console.log('Sending command to iframe:', data.command);
                if (data.command.startsWith('seek:')) {
                    const time = data.command.split(':')[1];
                    iframe.contentWindow.postMessage({ api: 'seek', set: time }, "*");
                    iframe.contentWindow.postMessage({ api: 'play' }, "*");
                } else {
                    const message = { api: data.command };
                    iframe.contentWindow.postMessage(message, "*");
                    console.log('Message sent to iframe:', message);
                }
            }
        }
    };

    if (error) {
        console.error("Rendering error message:", error);
        return <div>{error}</div>;
    }

    if (!isAuthenticated) {
        console.log("User is not authenticated");
        return (
            <div className="auth-message">
                Пожалуйста, войдите в систему, чтобы присоединиться к комнате и смотреть видео вместе.
            </div>
        );
    }

    if (isLoading) {
        console.log("Loading component is shown");
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
                        <div className="youtube-search">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search YouTube videos..."
                                className="youtube-search-input"
                            />
                            <button onClick={searchVideos} className="youtube-search-button">Search</button>
                        </div>
                        {videos.length > 0 && (
                            <div className="youtube-results">
                                {videos.map((video) => (
                                    <div key={video.id.videoId} onClick={() => selectVideo(video)} className="youtube-result-item">
                                        <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
                                        <p>{video.snippet.title}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <iframe id="player-iframe" frameBorder="0" allowFullScreen></iframe>
                        <div className="shared-player-controls">
                            <button id="play" onClick={handlePlay}><i className="fa-solid fa-play"></i></button>
                            <button id="pause" onClick={handlePause}><i className="fa-solid fa-pause"></i></button>
                            <button id="sync" onClick={handleSync}>Синхронизировать</button>
                        </div>
                        <h5 className="use-text">Для совместного просмотра пользуйся кнопками. Приятного просмотра 🍿</h5>
                        <p className="manual-text">
                            <span className="first-sentence">Кнопки совместного просмотра не поддерживаются некоторыми плеерами.</span><br />
                            Сезоны и серии переключаются вручную.
                        </p>
                    </div>
                    <div className="shared-player-chat-container">
                        <InviteLink roomId={roomId} />
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
                                onFocus={() => inputRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })}
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
