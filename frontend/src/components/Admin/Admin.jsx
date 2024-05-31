import {useState} from "react";
import './Admin.css'
import AdminUsers from "../AdminUsers/AdminUsers.jsx";
import AdminRooms from "../AdminRooms/AdminRooms.jsx";
import AdminYt from "../AdminYt/AdminYt.jsx";


export default function Admin() {
    const [activeSection, setActiveSection] = useState('');

    const toggleSection = (section) => {
        setActiveSection(prevSection => (prevSection === section ? '' : section));
    }

    
    return (
        <div className="admin-container">
            <h2 className="admin-panel-h2">Панель администратора</h2>
            <div className="sections-admin">
                <ul className="ul-admin">
                    <li className="li-admin" onClick={() => toggleSection('users')}>Пользователи</li>
                    <li className="li-admin" onClick={() => toggleSection('rooms')}>Комнаты</li>
                    <li className="li-admin" onClick={() => toggleSection('yt-rooms')}>Ютуб-комнаты</li>
                </ul>
            </div>
            {activeSection === 'users' && <AdminUsers />}
            {activeSection === 'rooms' && <AdminRooms />}
            {activeSection === 'yt-rooms' && <AdminYt />}
        </div>
    )
}