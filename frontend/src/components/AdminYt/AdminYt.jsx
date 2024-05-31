import {useEffect, useState} from "react";
import axios from "axios";
import './AdminYt.css'


export default function AdminYt() {
    const [ytRooms, setYtRooms] = useState([])

    useEffect(() => {
        const fetchYtRooms = () => {
            let url = "http://127.0.0.1:8000/api/v2/admin/get_all_yt_rooms";

            axios.get(url, {
                headers: { 'accept': 'application/json' }
            }).then(response => {
                setYtRooms(response.data);
            }).catch(error => {
                console.log("Ошибка при поиске:", error)
            });
        };

        fetchYtRooms();
    }, []);

    const deleteYtRoom = (id) => {
        let url = `http://127.0.0.1:8000/api/v2/admin/delete_yt_room?room=${id}`;

        axios.delete(url, {
            headers: { 'accept': 'application/json' }
        }).then(response => {
            if (response.status === 200) {
                setYtRooms(ytRooms.filter(room => room.id !== id));
            }
        }).catch(error => {
            console.log("Не удалось найти комнаты:", error);
        });
    };

    return (
        <div className="admin-yt-room-container">
            {ytRooms.map(room => (
                <div className="yt-room-card" key={room.youtube_room_id}>
                    <p><span>ID комнаты:</span> {room.youtube_room_id}</p>
                    <p><span>Пользователи:</span> {room.members}</p>
                    <button className="btn-yt-admin" onClick={() => deleteYtRoom(room.id)}><i
                        className="fa-solid fa-trash"></i></button>
                </div>
            ))}
        </div>
    )
}