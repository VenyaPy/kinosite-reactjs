import './Header.css'
import PropTypes from 'prop-types';

export default function Header({ setActiveSection }) {
  return (
    <div className="header">
        <div className="elements-header">
        <div className="logo" onClick={() => setActiveSection({ section: 'main', params: {} })}>КиноДом</div>
        <div className="sections">
            <ul>
                <li className="section" onClick={() => setActiveSection({ section: 'films', params: {} })}>Фильмы</li>
                <li className="section" onClick={() => setActiveSection({ section: 'series', params: {} })}>Сериалы</li>
                <li className="section" onClick={() => setActiveSection({ section: 'anime', params: {} })}>Аниме</li>
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