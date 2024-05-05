import "./Main.css"
import Search from "../Search/Search.jsx";
import Films from "../Films/Films.jsx";

export default function Main() {


    return (
        <div className="search-container">
            <div className="image-container">
                <img className="image" src="https://i.ibb.co/Pcm2cBZ/DALL-E-2024-05-04-22-38-40-A-v.webp" alt="some"/>
                <Search/>
            </div>
            <div className="popular-films">
                <h2>Популярные фильмы за месяц</h2>
            </div>
            <Films/>
        </div>
    )
}