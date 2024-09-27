import {useEffect, useState} from "react";
import axios from "axios";
import './AdminRooms.css'


export default function AdminRooms() {
    const [rooms, setRooms] = useState([])

    useEffect(() => {
        const fetchRooms = () => {
            let url = '/api/v2/admin/get_all_rooms';

            axios.get(url, {
                headers: { 'accept': 'application/json' }
            }).then(response => {
                setRooms(response.data);
            }).catch(error => {
                console.log('Комнаты не найдены:', error);
            });

        };

        fetchRooms();
    }, []);

    const deleteRooms = (id) => {
        let url = `/api/v2/admin/delete_room?id=${id}`;

        axios.delete(url, {
            headers: { 'accept': 'application/json' }
        }).then(response => {
            if (response.status === 200) {
                setRooms(rooms.filter(room => room.id !== id));
            }
        }).catch(error => {
            console.log("Не удалось удалить комнату", error);
        });
    };

    return (
        <div className="admin-rooms-container">
            {rooms.map(room => (
                <div className="room-card" key={room.room_id}>
                    <p><span>ID комнаты:</span> {room.room_id}</p>
                    <p><span>Пользователи:</span> {room.username}</p>
                    <p><span>Фильм:</span> {room.movieId}</p>
                    <button className="btn-admin-rooms" onClick={() => deleteRooms(room.id)}><i className="fa-solid fa-trash"></i></button>
                </div>
                ))}
        </div>
    );
}