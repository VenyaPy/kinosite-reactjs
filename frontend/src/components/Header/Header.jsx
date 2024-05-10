import './Header.css';
import PropTypes from 'prop-types';
import { useState } from "react";
import Register from "../Register/Register.jsx";
import Login from "../Login/Login.jsx"; // Импортируем компонент Login

export default function Header({ setActiveSection }) {
  const [showForm, setShowForm] = useState(null); // 'register', 'login', или null

  return (
    <div className="header">
        <div className="elements-header">
            <div className="logo" onClick={() => setActiveSection({ section: 'main', params: {} })}>КиноДом</div>
            <div className="sections">
                <ul>
                    <li className="section" onClick={() => setActiveSection({section: 'films', params: {}})}>Фильмы</li>
                    <li className="section" onClick={() => setActiveSection({section: 'series', params: {}})}>Сериалы</li>
                    <li className="section" onClick={() => setActiveSection({section: 'cartoon', params: {}})}>Мультфильмы</li>
                    <li className="section" onClick={() => setActiveSection({section: 'anime', params: {}})}>Аниме</li>
                </ul>
            </div>
            <div className="login" onClick={() => setShowForm('login')}>
                <img className="image" src="https://i.ibb.co/tBHSRDw/icons8-login-64.png" alt="login"/>
            </div>
            {showForm === 'register' && <Register toggleForm={() => setShowForm('login')} />}
            {showForm === 'login' && <Login toggleForm={() => setShowForm('register')} />}
        </div>
    </div>
  );
}

Header.propTypes = {
    setActiveSection: PropTypes.func.isRequired
};