import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './Register.css';

export default function Register( {toggleForm} ) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/v2/auth/register', {
                username,
                password,
                email
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Registration Success:', response.data);
        } catch (error) {
            console.error('Registration Error:', error);
        }
    };

    return (
        <div className="register-panel">
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
                <div className="login-link" onClick={toggleForm}>Уже зарегистрированы? Войдите</div>
            </form>
        </div>
    );
}

Register.propTypes = {
    toggleForm: PropTypes.func.isRequired
};

