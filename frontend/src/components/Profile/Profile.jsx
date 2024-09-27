import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from "../Loading/Loading.jsx";
import './Profile.css';
import userImage from '../../assets/user.png'; // Исправленный путь



// eslint-disable-next-line react/prop-types
export default function Profile({ closeModal }) {
    const navigate = useNavigate(); // Используем хук useNavigate
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        status: '',
        date: ''
    });
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(true);

    useEffect(() => {
        if (isModalOpen) {
            document.documentElement.classList.add('no-scroll');
        } else {
            document.documentElement.classList.remove('no-scroll');
        }

        return () => {
            document.documentElement.classList.remove('no-scroll');
        };
    }, [isModalOpen]);

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
                setUserId(response.data.id);
                setIsLoading(false);
            } catch (error) {
                setError(error.message);
                setIsLoading(false);
            }
        }

        fetchUserData();
    }, []);

    useEffect(() => {
        async function fetchUserHistory() {
            if (userId) {
                try {
                    const response = await axios.get(`https://ve1.po2014.fvds.ru:8000/api/v2/history/get_history`, {
                        params: { user_id: userId },
                        headers: { 'accept': 'application/json' }
                    });
                    setHistory(response.data);
                } catch (error) {
                    console.error('Error fetching user history:', error);
                }
            }
        }

        fetchUserHistory();
    }, [userId]);

    const handleAdminClick = () => {
        setIsModalOpen(false);
        closeModal();
        navigate('/admin');
    };

    if (isLoading) return <Loading />;
    if (error) return <div>Error: {error}</div>;

    const handleClose = () => {
        setIsModalOpen(false);
        closeModal();
    };

    const handleMovieClick = (id) => {
        handleClose(); // Закрываем модальное окно перед навигацией
        navigate(`/player/${id}`);
    };

    return (
        <>
            {isModalOpen && (
                <div className="modal-overlay-unique">
                    <div className="modal-content-unique">
                        <span className="close-modal-unique" onClick={handleClose}>&times;</span>
                        <div className="profile-content">
                            <img src={userImage} alt="User" className="profile-image"/>
                            <h1>Профиль</h1>
                            <div className="disk">
                                <p><strong>Никнейм:</strong> {userData.username}</p>
                                <p><strong>Email:</strong> {userData.email}</p>
                                <p><strong>Статус:</strong> {userData.status}</p>
                                <p><strong>Дата регистрации:</strong> {new Date(userData.date).toLocaleDateString()}</p>
                            </div>
                            {userData.status === 'admin' && (
                                <button className="admin-button" onClick={handleAdminClick}>
                                    Перейти в админ панель
                                </button>
                            )}
                            <h2>История просмотров</h2>
                            <div className="unique-movies-section">
                                {history.length === 0 ? (
                                    <p>Нет истории просмотров.</p>
                                ) : (
                                    history.slice().reverse().map(item => (
                                        <div
                                            key={item.id}
                                            className="unique-movie"
                                            onClick={() => handleMovieClick(item.id_film)} // Добавляем обработчик клика
                                        >
                                            <img src={item.poster_url} alt={item.name} className="unique-movie-poster" />
                                            <div className="unique-movie-overlay">
                                                <div className="unique-movie-info">
                                                    <h3 className="unique-movie-title">{item.name}</h3>
                                                    <p className="unique-movie-description">{item.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
