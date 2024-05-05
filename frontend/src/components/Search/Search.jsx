import "./Search.css"

export default function Search() {
    return (
        <div className="search-box">
            <input type="text" placeholder="Поиск фильмов..." className="search-input"/>
            <button className="search-button">
                <i className="fa-solid fa-magnifying-glass"></i>
            </button>
        </div>
    )
}