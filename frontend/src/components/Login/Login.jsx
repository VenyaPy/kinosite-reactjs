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
            const response = await axios.post('https://kinowild.ru/api/v2/auth/login', {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('token_timestamp', Date.now()); // Сохраняем текущее время в миллисекундах
            setAuthStatus(true);
            toggleForm(null); // Закрываем форму после успешного входа
        } catch (error) {
            setError('Неверный логин или пароль'); // Упрощаем обработку ошибок
        }
    };

    return (
        <div className="login-panel">
            <button className="close-button" onClick={() => toggleForm(null)}>&times;</button>
            <h2>Вход</h2>
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
            <div className="login-link" onClick={() => toggleForm('register')}>У вас нет аккаунта? Зарегистрируйтесь</div>
        </div>
    );
}

Login.propTypes = {
    toggleForm: PropTypes.func.isRequired,
    setAuthStatus: PropTypes.func.isRequired
};
