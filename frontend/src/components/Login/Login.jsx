import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './Login.css';

export default function Login({ toggleForm, setAuthStatus }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/v2/auth/login', {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Login Success:', response.data);
            localStorage.setItem('access_token', response.data.access_token);
            setAuthStatus(true);
            setTimeout(() => {
                toggleForm(null);  // Скрываем форму после успешного входа
            }, 2000);  // Сообщение исчезнет через 2 секунды
        } catch (error) {
            console.error('Login Error:', error);
            setError('Неверный логин или пароль');
        }
    };



    return (
        <div className="login-panel">
            <div className="text"><h2>Вход</h2></div>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label>Логин:</label>
                    <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Пароль:</label>
                    <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary">Войти</button>
                {error && <div className="error-message">{error}</div>}
            </form>
            <div className="login-link" onClick={() => toggleForm('register')}>У вас нет аккаунта? Зарегистрируйтесь
            </div>

        </div>
    );
}

Login.propTypes = {
    toggleForm: PropTypes.func.isRequired,
    setAuthStatus: PropTypes.func.isRequired
};