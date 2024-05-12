import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './Share.css'

export default function Share() {
    const currentURL = window.location.href;
    const [isCopied, setIsCopied] = useState(false);

    const onCopyText = () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
    };

    return (
        <div className="button-share">
            <CopyToClipboard text={currentURL} onCopy={onCopyText}>
                <button className="share-button">Поделиться с другом</button>
            </CopyToClipboard>
            {isCopied ? <span className="copy-message">Скопировано!</span> : null}
        </div>
    );
}
