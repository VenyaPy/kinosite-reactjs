import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './Register.css';

export default function Register({ toggleForm }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('/api/v2/auth/register', {
                username,
                password,
                email
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Registration Success:', response.data);
            setSuccessMessage('Регистрация прошла успешно!');
            setError('');
            setTimeout(() => {
                setSuccessMessage('');
                toggleForm('login');
            }, 3000);  // 3 секунды для отображения сообщения
        } catch (error) {
            console.error('Registration Error:', error.response ? error.response.data : "Неизвестная ошибка");
            setError('Ошибка регистрации. Пожалуйста, попробуйте снова.');
            setSuccessMessage('');
        }
    };

    return (
        <div className="register-panel">
            <button className="close-button" onClick={() => toggleForm(null)}>&times;</button>
            <div className="text"><h2>Регистрация</h2></div>
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <label>Логин:</label>
                    <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Пароль:</label>
                    <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary">Зарегистрироваться</button>
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message" style={{ color: 'lightgreen' }}>{successMessage}</div>}
                <div className="login-link" onClick={() => toggleForm('login')}>Уже зарегистрированы? Войдите</div>
            </form>
        </div>
    );
}

Register.propTypes = {
    toggleForm: PropTypes.func.isRequired
};
