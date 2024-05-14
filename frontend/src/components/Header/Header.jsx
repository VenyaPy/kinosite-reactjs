import './Header.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Register from '../Register/Register.jsx';
import Login from '../Login/Login.jsx';

export default function Header() {
    const navigate = useNavigate();
    const [authStatus, setAuthStatus] = useState(false);
    const [showForm, setShowForm] = useState(null);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const tokenTimestamp = parseInt(localStorage.getItem('token_timestamp'), 10);
        const now = Date.now();
        const tokenLifetime = 90 * 60 * 1000; // 90 минут в миллисекундах

        if (token && (now - tokenTimestamp < tokenLifetime)) {
            setAuthStatus(true);
            fetchUserProfile(token);
        } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_timestamp');
            setAuthStatus(false);
        }
    }, []);

    const fetchUserProfile = (token) => {
        axios.get('https://ve1.po2014.fvds.ru:8000/api/v2/users/profile', {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.data.username) {
                setUsername(response.data.username);
            }
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
            localStorage.removeItem('access_token'); // Удаляем токен если есть проблемы с аутентификацией
            localStorage.removeItem('token_timestamp');
            setAuthStatus(false);
        });
    };

    const handleLoginClick = () => {
        if (!authStatus) {
            setShowForm(showForm !== 'login' ? 'login' : null);
        } else {
            navigate('/profile'); // Navigating to profile page
        }
    };

    return (
        <div className="header">
            <div className="elements-header">
                <div className="logo" onClick={() => navigate('/')}>
                    WildKino
                </div>
                <div className="sections">
                    <ul>
                        <li className="section" onClick={() => navigate('/films')}>Фильмы</li>
                        <li className="section" onClick={() => navigate('/series')}>Сериалы</li>
                        <li className="section" onClick={() => navigate('/cartoon')}>Мультфильмы</li>
                        <li className="section" onClick={() => navigate('/anime')}>Аниме</li>
                    </ul>
                </div>
                <div className="login" onClick={handleLoginClick}>
                    <img
                        className={authStatus ? "image-user" : "image-login"}
                        src={authStatus ? "https://i.ibb.co/J3ThqY7/user.png" : "https://i.ibb.co/tBHSRDw/icons8-login-64.png"}
                        alt={authStatus ? "profile" : "login"}
                    />
                    {authStatus && <span className="auth-text">{username}</span>}
                    {!authStatus && <span className="auth-text">Войти</span>}
                </div>
                {showForm === 'login' && <Login toggleForm={setShowForm} setAuthStatus={setAuthStatus} />}
                {showForm === 'register' && <Register toggleForm={setShowForm} />}
            </div>
        </div>
    );
}
