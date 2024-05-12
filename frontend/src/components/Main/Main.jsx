import "./Main.css"
import Popular from "../Popular/Popular.jsx";
import Finder from "../Finder/Finder.jsx";
import { motion } from "framer-motion";

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
                <div className="image-container">
                    <img className="image" src="https://i.ibb.co/m6RLjND/123211223323132.jpg" alt="some" />
                    <Finder /> {/* Убрал setActiveSection */}
                </div>
                <div className="popular-films">
                    <h2>Популярные фильмы за месяц</h2>
                </div>
                <Popular /> {/* Убрал setActiveSection */}
            </div>
        </motion.div>
    );
}