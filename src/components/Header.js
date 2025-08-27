import { useState } from 'react';
import { FiKey, FiRefreshCw, FiX } from 'react-icons/fi';
import './Header.css';

const Header = ({ onRefresh, authToken, onAuthTokenChange }) => {
    const [showTokenInput, setShowTokenInput] = useState(false);
    const [tokenInput, setTokenInput] = useState(authToken);

    const handleTokenSave = () => {
        onAuthTokenChange(tokenInput);
        setShowTokenInput(false);
    };

    const handleTokenClear = () => {
        setTokenInput('');
        onAuthTokenChange('');
        setShowTokenInput(false);
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <h1 className="header-title">Blog API Tester</h1>
                    <span className="header-subtitle">Test your API endpoints dynamically</span>
                </div>

                <div className="header-right">
                    <button
                        className={`header-button ${authToken ? 'has-token' : ''}`}
                        onClick={() => setShowTokenInput(!showTokenInput)}
                        title={authToken ? 'Token configured' : 'Set auth token'}
                    >
                        <FiKey />
                        {authToken ? 'Token Set' : 'Auth Token'}
                    </button>

                    <button
                        className="header-button"
                        onClick={onRefresh}
                        title="Refresh API specification"
                    >
                        <FiRefreshCw />
                        Refresh
                    </button>
                </div>
            </div>

            {showTokenInput && (
                <div className="token-input-overlay">
                    <div className="token-input-panel">
                        <div className="token-input-header">
                            <h3>Set Authentication Token</h3>
                            <button
                                className="close-button"
                                onClick={() => setShowTokenInput(false)}
                            >
                                <FiX />
                            </button>
                        </div>

                        <div className="token-input-body">
                            <label>Bearer Token:</label>
                            <input
                                type="text"
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                                placeholder="Enter your access token here..."
                                className="token-input"
                            />

                            <div className="token-input-actions">
                                <button onClick={handleTokenClear} className="button-secondary">
                                    Clear
                                </button>
                                <button onClick={handleTokenSave} className="button-primary">
                                    Save Token
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
