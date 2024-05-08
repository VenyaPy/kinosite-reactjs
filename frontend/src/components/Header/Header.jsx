import './Header.css'
import PropTypes from 'prop-types';

export default function Header({ setActiveSection }) {
  return (
    <div className="header">
        <div className="elements-header">
        <div className="logo" onClick={() => setActiveSection('main')}>КиноДом</div>
        <div className="sections">
            <ul>
                <li className="section" onClick={() => setActiveSection('films')}>Фильмы</li>
                <li className="section" onClick={() => setActiveSection('series')}>Сериалы</li>
                <li className="section" onClick={() => setActiveSection('anime')}>Аниме</li>
            </ul>
        </div>
        <div className="login">
            <img className="image" src="https://i.ibb.co/tBHSRDw/icons8-login-64.png" alt="login"/>
        </div>
        </div>
    </div>
  );
}

Header.propTypes = {
  setActiveSection: PropTypes.func.isRequired
};