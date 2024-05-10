import "./Main.css"
import Popular from "../Popular/Popular.jsx";
import Finder from "../Finder/Finder.jsx";
import { motion } from "framer-motion";
import PropTypes from 'prop-types'; // Для валидации пропсов


export default function Main({ setActiveSection }) {

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
                    <img className="image" src="https://i.ibb.co/m6RLjND/123211223323132.jpg" alt="some"/>
                </div>
                <Finder setActiveSection={setActiveSection} />
                <div className="popular-films">
                    <h2>Популярные фильмы за месяц</h2>
                </div>
                <Popular setActiveSection={setActiveSection} />
            </div>
        </motion.div>
    );
}

Main.propTypes = {
    setActiveSection: PropTypes.func.isRequired,
};