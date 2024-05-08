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
                <img className="image" src="https://i.ibb.co/Pcm2cBZ/DALL-E-2024-05-04-22-38-40-A-v.webp" alt="some"/>
            </div>
            <Finder/>
            <div className="popular-films">
                <h2>Популярные фильмы за месяц</h2>
            </div>
            <Popular/>
        </div>
        </motion.div>
    )
}