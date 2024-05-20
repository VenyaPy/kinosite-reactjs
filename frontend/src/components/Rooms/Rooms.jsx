import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import './Rooms.css';
import Loading from '../Loading/Loading'; // Импортируем компонент Loading

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [countRooms, setCountRooms] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Добавляем состояние для отслеживания загрузки

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
            setIsLoading(false); // Завершаем загрузку
        }).catch(error => {
            console.error('Ошибка при поиске комнат', error);
            setIsLoading(false); // Завершаем загрузку в случае ошибки
        });
    }, []);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    if (isLoading) {
        return <Loading />; // Показываем компонент Loading пока идет загрузка
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="projects-container-room"
        >
            <div className="rooms-container">
                <div className="h2-rooms">
                    <h2>Комнаты совместного просмотра</h2>
                    <div className="p-rooms">
                        <p>Присоединяйся, знакомься, и смотри фильмы вместе!</p>
                    </div>
                </div>
                {countRooms ? (
                    <div className="item-room-container">
                        {rooms.map(room => (
                            room.poster && (
                                <div onClick={() => window.location.href = room.watch} key={room.roomId} className="unique-room">
                                    <img src={room.poster} alt={room.name} className="unique-room-poster"/>
                                    <div className="room-info">
                                        <div className="room-title">{room.name}</div>
                                        <div className="room-members">
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
                    <div className="no-rooms-message">
                        <p>На данный момент никто не смотрит фильмы 🥺</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
