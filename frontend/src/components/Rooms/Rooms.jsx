import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import './Rooms.css';
import Loading from '../Loading/Loading';

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [countRooms, setCountRooms] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchRooms = useCallback(() => {
        let url = "http://127.0.0.1:8000/api/v2/rooms/all_rooms";

        axios.get(url, {
            headers: { 'accept': 'application/json' }
        }).then(response => {
            const result = response.data;
            if (result.length > 0) {
                setCountRooms(true);
            } else {
                setCountRooms(false);
            }
            setRooms(result);
            setIsLoading(false);
        }).catch(error => {
            console.error('Ошибка при поиске комнат', error);
            setIsLoading(false);
        });
    }, []);

    const createYouTubeRoom = async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const response = await axios.post('http://127.0.0.1:8000/api/v2/youtube_room/create_room', {}, {
                    headers: {
                        'accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const youtubeRoomId = response.data.video_id;
                navigate(`/youtube/${youtubeRoomId}`);
            } catch (error) {
                console.error('Error creating YouTube room:', error);
            }
        } else {
            alert('Вам нужно войти в аккаунт, чтобы использовать функцию создания комнаты YouTube');
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="rooms-projects-container-room"
        >
            <div className="rooms-container">
                <div className="rooms-header-container">
                    <h2 className="rooms-title">Комнаты совместного просмотра</h2>
                    <p className="rooms-description">Присоединяйся, знакомься, и смотри фильмы вместе!</p>
                    <button onClick={createYouTubeRoom} className="rooms-create-room-button">Создать YouTube Комнату</button>
                </div>
                {countRooms ? (
                    <div className="rooms-item-room-container">
                        {rooms.map(room => (
                            room.poster && (
                                <div onClick={() => window.location.href = room.watch} key={room.roomId} className="rooms-unique-room">
                                    <img src={room.poster} alt={room.name} className="rooms-unique-room-poster"/>
                                    <div className="rooms-room-info">
                                        <div className="rooms-room-title">{room.name}</div>
                                        <div className="rooms-room-members">
                                            <svg width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                                                <path d="M16 8s-3-5.333-8-5.333S0 8 0 8s3 5.333 8 5.333S16 8 16 8zm-8 4A4 4 0 1 1 8 4a4 4 0 0 1 0 8zm0-1A3 3 0 1 0 8 5a3 3 0 0 0 0 6zm0-1.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                                            </svg>
                                            {room.member}
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="rooms-no-rooms-message">
                        <p>На данный момент никто не смотрит фильмы 🥺</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}