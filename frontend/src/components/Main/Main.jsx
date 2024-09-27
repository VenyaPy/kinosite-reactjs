import "./Main.css"
import Popular from "../Popular/Popular.jsx";
import Finder from "../Finder/Finder.jsx";
import { motion } from "framer-motion";
import mainImage from '../../assets/main.jpg'; // Исправленный путь


export default function Main() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="projects-container"
        >
            <div className="search-container">
                <div className="image-container-g">
                    <img className="image-ge" src={mainImage} alt="Main" /> {/* Используем импортированное изображение */}
                    <Finder />
                </div>
                <div className="popular-films">
                    <h2>Популярные фильмы за месяц</h2>
                </div>
                <Popular />
            </div>
        </motion.div>
    );
}