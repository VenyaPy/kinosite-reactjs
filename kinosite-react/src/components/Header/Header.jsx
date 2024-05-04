import './Header.css'

export default function Header() {


    return (
        <div className="header">
            <div className="elements-header">
            <div className="logo">КиноДом</div>
            <div className="sections">
                <ul>
                    <li className="section">Фильмы</li>
                    <li className="section">Сериалы</li>
                    <li className="section">Аниме</li>
                </ul>
            </div>
                <div className="search-form">
                <form action="" method="get">
                    <input className="search-form__txt" placeholder="Поиск..." type="text"/>
                    <button className="search-form__btn" type="submit"></button>
                </form>
            </div>
                <div className="login">
                    <img className="image" src="https://i.ibb.co/tBHSRDw/icons8-login-64.png" alt="login"/>
                </div>

            </div>
        </div>
    )
}