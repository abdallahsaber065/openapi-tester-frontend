import { useState } from 'react';
import { FiRefreshCw, FiX, FiUpload, FiLock } from 'react-icons/fi';
import './Header.css';

const Header = ({ onRefresh, authToken, onAuthTokenChange, onLoadSpec, onShowAuth, securitySchemes, authenticatedCount }) => {
    const [showTokenInput, setShowTokenInput] = useState(false);
    const [showLoadSpec, setShowLoadSpec] = useState(false);
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
                    <h1 className="header-title">OpenAPI Tester</h1>
                    <span className="header-subtitle">Test any OpenAPI-compliant API</span>
                </div>

                <div className="header-right">
                    <button
                        className="header-button"
                        onClick={() => setShowLoadSpec(!showLoadSpec)}
                        title="Load API specification"
                    >
                        <FiUpload />
                        Load API
                    </button>

                    {Object.keys(securitySchemes).length > 0 && (
                        <button
                            className={`header-button ${authenticatedCount > 0 ? 'has-auth' : ''}`}
                            onClick={onShowAuth}
                            title={authenticatedCount > 0 ? `${authenticatedCount} auth method(s) configured` : 'Configure authentication'}
                        >
                            <FiLock />
                            Authorize
                            {authenticatedCount > 0 && (
                                <span className="auth-count">{authenticatedCount}</span>
                            )}
                        </button>
                    )}

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

            {showLoadSpec && (
                <LoadSpecPanel
                    onClose={() => setShowLoadSpec(false)}
                    onLoadSpec={onLoadSpec}
                />
            )}
        </header>
    );
};

// Load Specification Panel Component
const LoadSpecPanel = ({ onClose, onLoadSpec }) => {
    const [activeMethod, setActiveMethod] = useState('url');
    const [specUrl, setSpecUrl] = useState('');
    const [apiBaseUrl, setApiBaseUrl] = useState('');
    const [jsonContent, setJsonContent] = useState('');
    const [loading, setLoading] = useState(false);

    const extractBaseUrl = (url) => {
        try {
            const urlObj = new URL(url);
            // Remove the path to get base URL
            return `${urlObj.protocol}//${urlObj.host}`;
        } catch {
            return '';
        }
    };

    const handleSpecUrlChange = (url) => {
        setSpecUrl(url);
        // Auto-detect base URL
        const baseUrl = extractBaseUrl(url);
        if (baseUrl) {
            setApiBaseUrl(baseUrl);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    const parsedJson = JSON.parse(content); // Validate JSON
                    setJsonContent(content);
                    
                    // Auto-extract base URL from servers if available
                    if (parsedJson.servers && parsedJson.servers.length > 0) {
                        const serverUrl = parsedJson.servers[0].url;
                        setApiBaseUrl(serverUrl);
                    } else if (!apiBaseUrl) {
                        // Set a default placeholder if no servers defined
                        setApiBaseUrl('https://api.example.com');
                    }
                } catch (error) {
                    alert('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleLoadSpec = async () => {
        setLoading(true);
        try {
            let specData = null;

            if (activeMethod === 'url') {
                if (!specUrl) {
                    alert('Please enter OpenAPI URL');
                    return;
                }
                const response = await fetch(specUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch specification');
                }
                specData = await response.json();
            } else if (activeMethod === 'file' || activeMethod === 'direct') {
                if (!jsonContent) {
                    alert('Please provide JSON content');
                    return;
                }
                specData = JSON.parse(jsonContent);
            }

            let finalApiBaseUrl = apiBaseUrl;
            
            if (!finalApiBaseUrl) {
                if (activeMethod === 'file' || activeMethod === 'direct') {
                    // For file/direct upload, try to extract from spec or use default
                    if (specData && specData.servers && specData.servers.length > 0) {
                        finalApiBaseUrl = specData.servers[0].url;
                        setApiBaseUrl(finalApiBaseUrl);
                    } else {
                        alert('Please enter API base URL (could not auto-detect from specification)');
                        return;
                    }
                } else {
                    alert('Please enter API base URL');
                    return;
                }
            }

            await onLoadSpec(specData, finalApiBaseUrl);
            onClose();
        } catch (error) {
            alert(`Error loading specification: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="token-input-overlay">
            <div className="load-spec-panel">
                <div className="load-spec-header">
                    <h3>Load OpenAPI Specification</h3>
                    <button className="close-button" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="load-spec-body">
                    <div className="method-tabs">
                        <button
                            className={`method-tab ${activeMethod === 'url' ? 'active' : ''}`}
                            onClick={() => setActiveMethod('url')}
                        >
                            From URL
                        </button>
                        <button
                            className={`method-tab ${activeMethod === 'file' ? 'active' : ''}`}
                            onClick={() => setActiveMethod('file')}
                        >
                            Upload File
                        </button>
                        <button
                            className={`method-tab ${activeMethod === 'direct' ? 'active' : ''}`}
                            onClick={() => setActiveMethod('direct')}
                        >
                            Direct Input
                        </button>
                    </div>

                    <div className="method-content">
                        {activeMethod === 'url' && (
                            <div className="form-section">
                                <label>OpenAPI JSON URL:</label>
                                <input
                                    type="url"
                                    value={specUrl}
                                    onChange={(e) => handleSpecUrlChange(e.target.value)}
                                    placeholder="https://api.example.com/openapi.json"
                                    className="spec-input"
                                />
                                <small>Example: https://petstore.swagger.io/v2/swagger.json</small>
                            </div>
                        )}

                        {activeMethod === 'file' && (
                            <div className="form-section">
                                <label>Select OpenAPI JSON File:</label>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                    className="file-input"
                                />
                                {jsonContent && (
                                    <small style={{color: 'green', marginTop: '5px', display: 'block'}}>
                                        ✓ File loaded successfully
                                    </small>
                                )}
                            </div>
                        )}

                        {activeMethod === 'direct' && (
                            <div className="form-section">
                                <label>Paste OpenAPI JSON:</label>
                                <textarea
                                    value={jsonContent}
                                    onChange={(e) => setJsonContent(e.target.value)}
                                    placeholder="Paste your OpenAPI JSON specification here..."
                                    rows={8}
                                    className="json-textarea"
                                />
                            </div>
                        )}

                        <div className="form-section">
                            <label>API Base URL:</label>
                            <input
                                type="url"
                                value={apiBaseUrl}
                                onChange={(e) => setApiBaseUrl(e.target.value)}
                                placeholder="https://api.example.com"
                                className="spec-input"
                            />
                            <small>
                                The base URL where your API is hosted
                                {activeMethod === 'file' && apiBaseUrl && (
                                    <span style={{color: 'green'}}> (auto-detected from file)</span>
                                )}
                            </small>
                        </div>
                    </div>

                    <div className="load-spec-actions">
                        <button onClick={onClose} className="button-secondary">
                            Cancel
                        </button>
                        <button
                            onClick={handleLoadSpec}
                            disabled={loading}
                            className="button-primary"
                        >
                            {loading ? 'Loading...' : 'Load Specification'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
