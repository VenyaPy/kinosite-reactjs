import { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from "../Loading/Loading.jsx";
import './Profile.css'


export default function Profile() {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        status: '',
        date: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchUserData() {
            const token = localStorage.getItem('access_token');
            try {
                const response = await axios.get('https://ve1.po2014.fvds.ru:8000/api/v2/users/profile', {
                    headers: {
                        'accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                setUserData({
                    username: response.data.username,
                    email: response.data.email,
                    status: response.data.status,
                    date: response.data.date
                });
                setIsLoading(false);
            } catch (error) {
                setError(error.message);
                setIsLoading(false);
            }
        }

        fetchUserData();
    }, []);

    if (isLoading) return <Loading/>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="profile">
            <img src="https://i.ibb.co/J3ThqY7/user.png" alt="User" />
            <h1>Профиль</h1>
            <p><strong>Никнейм:</strong> {userData.username}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Статус:</strong> {userData.status}</p>
            <p><strong>Дата регистрации:</strong> {new Date(userData.date).toLocaleDateString()}</p>
        </div>
    );
}
