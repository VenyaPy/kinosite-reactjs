import './Finder.css'

export default function Finder() {


    return (
        <div className="finder-container">
            <div className="search-finder">
                <input type="text" placeholder="Поиск фильмов..." className="search-input-finder"/>
                <button className="search-button-finder">
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>
            </div>
        </div>
    )
}