import './InviteLink.css'

// eslint-disable-next-line react/prop-types
export default function InviteLink({ roomId }) {
    const inviteLink = `${window.location.origin}/shared/${roomId}`;

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
            <button onClick={handleCopyLink} className="share-button">Ссылка для друга</button>
        </div>
    );
}
