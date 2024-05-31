import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import './AdminUsers.css'; // Импортируем CSS файл

export default function AdminUsers() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = () => {
            let url = 'http://127.0.0.1:8000/api/v2/admin/get_all_users';

            axios.get(url, {
                headers: { 'accept': 'application/json' }
            }).then(response => {
                setUsers(response.data);
            }).catch(error => {
                console.log("Не получилось найти пользователей:", error);
            });
        };

        fetchUsers();
    }, []);

    const deleteUser = (id) => {
        let url = `http://127.0.0.1:8000/api/v2/admin/delete_user?id=${id}`;

        axios.delete(url, {
            headers: { 'accept': 'application/json' }
        }).then(response => {
            if (response.status === 200) {
                setUsers(users.filter(user => user.id !== id));
            }
        }).catch(error => {
            console.log("Не удалось удалить пользователя:", error);
        });
    };

    return (
        <div className="admin-users-container">
            {users.map(user => (
                <div className="user-card" key={user.username}>
                    <p><span>Имя:</span> {user.username}</p>
                    <p><span>Email:</span> {user.email}</p>
                    <p><span>Дата регистрации:</span> {format(new Date(user.date), 'yyyy-MM-dd HH:mm')}</p>
                    <p><span>Статус:</span> {user.status}</p>
                    <button className="btn-admin" onClick={() => deleteUser(user.id)}><i className="fa-solid fa-trash"></i></button>
                </div>
            ))}
        </div>
    );
}
