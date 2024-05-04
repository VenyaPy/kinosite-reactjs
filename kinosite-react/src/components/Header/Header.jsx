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
            <div className="search">
                <form action="" method="get">
                    <input name="s" placeholder="Поиск..." type="search"/>
                    <button type="submit">🔎</button>
                </form>
            </div>

            </div>
        </div>
    )
}