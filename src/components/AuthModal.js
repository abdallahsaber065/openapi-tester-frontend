import { useState } from 'react';
import { FiX, FiLock, FiKey, FiUser, FiShield } from 'react-icons/fi';
import { 
    AUTH_TYPES, 
    HTTP_SCHEMES, 
    OAUTH2_FLOWS,
    validateAuth 
} from '../services/auth';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, securitySchemes, authData, onAuthUpdate }) => {
    const [activeScheme, setActiveScheme] = useState(null);
    const [localAuthData, setLocalAuthData] = useState(authData);
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const handleSchemeSelect = (schemeName) => {
        setActiveScheme(schemeName);
        setErrors({});
    };

    const handleAuthDataChange = (schemeName, field, value) => {
        setLocalAuthData(prev => ({
            ...prev,
            [schemeName]: {
                ...prev[schemeName],
                [field]: value
            }
        }));

        // Clear errors for this field
        if (errors[schemeName]) {
            setErrors(prev => ({
                ...prev,
                [schemeName]: prev[schemeName].filter(error => !error.includes(field))
            }));
        }
    };

    const handleSave = () => {
        const newErrors = {};
        let hasErrors = false;

        // Validate all schemes with data
        Object.entries(localAuthData).forEach(([schemeName, auth]) => {
            const scheme = securitySchemes[schemeName];
            if (scheme && auth && Object.values(auth).some(val => val)) {
                const validation = validateAuth(auth, scheme);
                if (!validation.isValid) {
                    newErrors[schemeName] = validation.errors;
                    hasErrors = true;
                }
            }
        });

        if (hasErrors) {
            setErrors(newErrors);
            return;
        }

        onAuthUpdate(localAuthData);
        onClose();
    };

    const handleClear = (schemeName) => {
        setLocalAuthData(prev => ({
            ...prev,
            [schemeName]: {}
        }));
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[schemeName];
            return newErrors;
        });
    };

    const getSchemeIcon = (scheme) => {
        switch (scheme.type) {
            case AUTH_TYPES.API_KEY:
                return <FiKey />;
            case AUTH_TYPES.HTTP:
                return scheme.scheme === HTTP_SCHEMES.BASIC ? <FiUser /> : <FiShield />;
            case AUTH_TYPES.OAUTH2:
                return <FiLock />;
            case AUTH_TYPES.OPENID_CONNECT:
                return <FiLock />;
            default:
                return <FiShield />;
        }
    };

    const getSchemeDisplayName = (scheme) => {
        switch (scheme.type) {
            case AUTH_TYPES.API_KEY:
                return `API Key (${scheme.in})`;
            case AUTH_TYPES.HTTP:
                return `HTTP ${scheme.scheme.toUpperCase()}`;
            case AUTH_TYPES.OAUTH2:
                return 'OAuth 2.0';
            case AUTH_TYPES.OPENID_CONNECT:
                return 'OpenID Connect';
            default:
                return scheme.type;
        }
    };

    const renderSchemeForm = (schemeName, scheme) => {
        const auth = localAuthData[schemeName] || {};

        switch (scheme.type) {
            case AUTH_TYPES.API_KEY:
                return (
                    <div className="auth-form">
                        <div className="form-field">
                            <label>
                                {scheme.parameterName}
                                <span className="auth-location">({scheme.in})</span>
                            </label>
                            <input
                                type="password"
                                value={auth.value || ''}
                                onChange={(e) => handleAuthDataChange(schemeName, 'value', e.target.value)}
                                placeholder={`Enter your API key for ${scheme.parameterName}`}
                                className="auth-input"
                            />
                        </div>
                        {scheme.description && (
                            <div className="auth-description">{scheme.description}</div>
                        )}
                    </div>
                );

            case AUTH_TYPES.HTTP:
                if (scheme.scheme === HTTP_SCHEMES.BASIC) {
                    return (
                        <div className="auth-form">
                            <div className="form-field">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={auth.username || ''}
                                    onChange={(e) => handleAuthDataChange(schemeName, 'username', e.target.value)}
                                    placeholder="Enter username"
                                    className="auth-input"
                                />
                            </div>
                            <div className="form-field">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={auth.password || ''}
                                    onChange={(e) => handleAuthDataChange(schemeName, 'password', e.target.value)}
                                    placeholder="Enter password"
                                    className="auth-input"
                                />
                            </div>
                            {scheme.description && (
                                <div className="auth-description">{scheme.description}</div>
                            )}
                        </div>
                    );
                } else if (scheme.scheme === HTTP_SCHEMES.BEARER) {
                    return (
                        <div className="auth-form">
                            <div className="form-field">
                                <label>
                                    Bearer Token
                                    {scheme.bearerFormat && <span className="auth-format">({scheme.bearerFormat})</span>}
                                </label>
                                <textarea
                                    value={auth.token || ''}
                                    onChange={(e) => handleAuthDataChange(schemeName, 'token', e.target.value)}
                                    placeholder="Enter bearer token"
                                    className="auth-textarea"
                                    rows={3}
                                />
                            </div>
                            {scheme.description && (
                                <div className="auth-description">{scheme.description}</div>
                            )}
                        </div>
                    );
                }
                break;

            case AUTH_TYPES.OAUTH2:
                return (
                    <div className="auth-form">
                        <div className="oauth-flows">
                            <h4>Available OAuth 2.0 Flows:</h4>
                            {Object.entries(scheme.flows || {}).map(([flowType, flow]) => (
                                <div key={flowType} className="oauth-flow">
                                    <strong>{formatFlowName(flowType)}</strong>
                                    {flow.authorizationUrl && (
                                        <div className="flow-detail">
                                            <span>Authorization URL: </span>
                                            <a href={flow.authorizationUrl} target="_blank" rel="noopener noreferrer">
                                                {flow.authorizationUrl}
                                            </a>
                                        </div>
                                    )}
                                    {flow.tokenUrl && (
                                        <div className="flow-detail">
                                            <span>Token URL: </span>
                                            <code>{flow.tokenUrl}</code>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {scheme.scopes && scheme.scopes.length > 0 && (
                            <div className="oauth-scopes">
                                <h4>Available Scopes:</h4>
                                <div className="scopes-list">
                                    {scheme.scopes.map((scopeObj, index) => (
                                        <div key={index} className="scope-item">
                                            <code>{scopeObj.scope}</code>
                                            <span>{scopeObj.description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="form-field">
                            <label>Access Token</label>
                            <textarea
                                value={auth.accessToken || ''}
                                onChange={(e) => handleAuthDataChange(schemeName, 'accessToken', e.target.value)}
                                placeholder="Paste your OAuth 2.0 access token here"
                                className="auth-textarea"
                                rows={3}
                            />
                            <div className="auth-help">
                                Obtain your access token using one of the OAuth 2.0 flows above, then paste it here.
                            </div>
                        </div>

                        {scheme.description && (
                            <div className="auth-description">{scheme.description}</div>
                        )}
                    </div>
                );

            case AUTH_TYPES.OPENID_CONNECT:
                return (
                    <div className="auth-form">
                        <div className="openid-info">
                            <h4>OpenID Connect</h4>
                            <div className="flow-detail">
                                <span>Discovery URL: </span>
                                <a href={scheme.openIdConnectUrl} target="_blank" rel="noopener noreferrer">
                                    {scheme.openIdConnectUrl}
                                </a>
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Access Token</label>
                            <textarea
                                value={auth.accessToken || ''}
                                onChange={(e) => handleAuthDataChange(schemeName, 'accessToken', e.target.value)}
                                placeholder="Paste your OpenID Connect access token here"
                                className="auth-textarea"
                                rows={3}
                            />
                            <div className="auth-help">
                                Obtain your access token from your OpenID Connect provider, then paste it here.
                            </div>
                        </div>

                        {scheme.description && (
                            <div className="auth-description">{scheme.description}</div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="auth-form">
                        <div className="unsupported-scheme">
                            <p>Authentication type "{scheme.type}" is not yet supported.</p>
                            {scheme.description && (
                                <div className="auth-description">{scheme.description}</div>
                            )}
                        </div>
                    </div>
                );
        }
    };

    const formatFlowName = (flowType) => {
        switch (flowType) {
            case OAUTH2_FLOWS.AUTHORIZATION_CODE:
                return 'Authorization Code Flow';
            case OAUTH2_FLOWS.IMPLICIT:
                return 'Implicit Flow';
            case OAUTH2_FLOWS.PASSWORD:
                return 'Resource Owner Password Credentials Flow';
            case OAUTH2_FLOWS.CLIENT_CREDENTIALS:
                return 'Client Credentials Flow';
            default:
                return flowType;
        }
    };

    const hasAuthData = (schemeName) => {
        const auth = localAuthData[schemeName];
        return auth && Object.values(auth).some(val => val && val.trim());
    };

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal">
                <div className="auth-modal-header">
                    <h2>
                        <FiLock />
                        Authorize
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="auth-modal-body">
                    {Object.keys(securitySchemes).length === 0 ? (
                        <div className="no-auth">
                            <p>No authentication methods are defined for this API.</p>
                        </div>
                    ) : (
                        <>
                            <div className="auth-schemes-list">
                                {Object.entries(securitySchemes).map(([schemeName, scheme]) => (
                                    <div
                                        key={schemeName}
                                        className={`auth-scheme-item ${activeScheme === schemeName ? 'active' : ''} ${hasAuthData(schemeName) ? 'configured' : ''}`}
                                        onClick={() => handleSchemeSelect(schemeName)}
                                    >
                                        <div className="scheme-header">
                                            <div className="scheme-icon">
                                                {getSchemeIcon(scheme)}
                                            </div>
                                            <div className="scheme-info">
                                                <div className="scheme-name">{schemeName}</div>
                                                <div className="scheme-type">{getSchemeDisplayName(scheme)}</div>
                                            </div>
                                            {hasAuthData(schemeName) && (
                                                <div className="scheme-status">
                                                    <span className="configured-badge">Configured</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {activeScheme && (
                                <div className="auth-form-container">
                                    <div className="auth-form-header">
                                        <h3>{activeScheme}</h3>
                                        {hasAuthData(activeScheme) && (
                                            <button
                                                className="clear-auth-button"
                                                onClick={() => handleClear(activeScheme)}
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>

                                    {errors[activeScheme] && (
                                        <div className="auth-errors">
                                            {errors[activeScheme].map((error, index) => (
                                                <div key={index} className="auth-error">{error}</div>
                                            ))}
                                        </div>
                                    )}

                                    {renderSchemeForm(activeScheme, securitySchemes[activeScheme])}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="auth-modal-footer">
                    <button className="button-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="button-primary" onClick={handleSave}>
                        Save Authentication
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
