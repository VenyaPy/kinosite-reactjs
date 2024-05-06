import './App.css'
import Header from "./components/Header/Header.jsx";
import Main from "./components/Main/Main.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Finder from "./components/Finder/Finder.jsx";

function App() {


    return (
        <>
            <Header/>
            <div className="main-container">


                <Finder/>


            </div>
            <Footer/>
        </>
    )
}

export default App
