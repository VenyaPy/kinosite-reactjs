import './InviteLink.css'
import { useLocation } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
export default function InviteLink({ roomId }) {
    const location = useLocation();
    let inviteLink;

    if (location.pathname.startsWith('/youtube')) {
        inviteLink = `${window.location.origin}/youtube/${roomId}`;
    } else {
        inviteLink = `${window.location.origin}/shared/${roomId}`;
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink)
            .then(() => {
                alert('Ссылка скопирована!');
            })
            .catch((err) => {
                console.error('Не удалось получить ссылку: ', err);
            });
    };

    return (
        <div className="button-share">
            <button onClick={handleCopyLink} className="share-button-invite">Ссылка для друга</button>
        </div>
    );
}
