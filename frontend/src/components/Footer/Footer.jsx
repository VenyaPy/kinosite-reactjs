import './Footer.css'

export default function Footer() {
    return (
        <div className="footer-container">
            <div className="footer-section about">
                <h4>О компании</h4>
                <p>Бесплатный просмотр фильмов разного жанра.</p>
            </div>
            <div className="footer-section social">
                <a href="http://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-telegram"></i></a>
                <a href="http://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-vk"></i></a>
                <a href="http://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-instagram"></i></a>
            </div>
            <div className="footer-section contact">
                <h4>Контакты</h4>
                <p>Email: ve.po2014@yandex.ru</p>
                <p>Телефон: +993 609 7096</p>
            </div>
        </div>
    );
}