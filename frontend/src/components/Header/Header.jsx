import './Header.css';
import PropTypes from 'prop-types';
import {useEffect, useState} from "react";
import Register from "../Register/Register.jsx";
import Login from "../Login/Login.jsx"; // Импортируем компонент Login


export default function Header({ setActiveSection }) {
    const [authStatus, setAuthStatus] = useState(false);
    const [showForm, setShowForm] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setAuthStatus(true);
        }
    }, []);

    const handleLoginClick = () => {
        if (!authStatus) {
            setShowForm(showForm !== 'login' ? 'login' : null);
        } else {
            setActiveSection({ section: 'profile', params: {} });  // Обработка перехода на профиль
        }
    };

    return (
        <div className="header">
            <div className="elements-header">
                <div className="logo" onClick={() => setActiveSection({ section: 'main', params: {} })}>
                    КиноДом
                </div>
                <div className="sections">
                    <ul>
                        <li className="section" onClick={() => setActiveSection({ section: 'films', params: {}})}>Фильмы</li>
                        <li className="section" onClick={() => setActiveSection({ section: 'series', params: {}})}>Сериалы</li>
                        <li className="section" onClick={() => setActiveSection({ section: 'cartoon', params: {}})}>Мультфильмы</li>
                        <li className="section" onClick={() => setActiveSection({ section: 'anime', params: {}})}>Аниме</li>
                    </ul>
                </div>
                <div className="login" onClick={handleLoginClick}>
                    <img
                        className={authStatus ? "image-user" : "image-login"}
                        src={authStatus ? "https://i.ibb.co/J3ThqY7/user.png" : "https://i.ibb.co/tBHSRDw/icons8-login-64.png"}
                        alt={authStatus ? "profile" : "login"}
                    />
                </div>
                {showForm === 'login' && <Login toggleForm={setShowForm} setAuthStatus={setAuthStatus} />}
                {showForm === 'register' && <Register toggleForm={setShowForm} />}
            </div>
        </div>
    );
}

Header.propTypes = {
    setActiveSection: PropTypes.func.isRequired
};