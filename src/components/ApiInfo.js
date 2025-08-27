import { FiInfo, FiExternalLink, FiMail, FiGlobe } from 'react-icons/fi';
import './ApiInfo.css';

const ApiInfo = ({ openApiSpec }) => {
    if (!openApiSpec) {
        return (
            <div className="api-info-empty">
                <FiInfo />
                <p>No API specification loaded</p>
                <small>Click "Load API" to get started</small>
            </div>
        );
    }

    const { info, servers, externalDocs } = openApiSpec;

    const formatVersion = (version) => {
        if (!version) return 'Unknown';
        return `v${version}`;
    };

    const formatServerUrl = (server) => {
        if (typeof server === 'string') return server;
        return server.url || 'Unknown URL';
    };

    const formatServerDescription = (server) => {
        if (typeof server === 'string') return null;
        return server.description;
    };

    return (
        <div className="api-info">
            <div className="api-info-header">
                <FiInfo className="api-info-icon" />
                <h3>API Information</h3>
            </div>

            <div className="api-info-content">
                {/* Basic Info */}
                <div className="info-section">
                    <div className="info-item">
                        <label>Title:</label>
                        <span className="info-value title">{info?.title || 'Untitled API'}</span>
                    </div>

                    <div className="info-item">
                        <label>Version:</label>
                        <span className="info-value version">{formatVersion(info?.version)}</span>
                    </div>

                    {info?.description && (
                        <div className="info-item description">
                            <label>Description:</label>
                            <div className="info-value">{info.description}</div>
                        </div>
                    )}

                    <div className="info-item">
                        <label>OpenAPI Version:</label>
                        <span className="info-value">{openApiSpec.openapi || openApiSpec.swagger || 'Unknown'}</span>
                    </div>
                </div>

                {/* Servers */}
                {servers && servers.length > 0 && (
                    <div className="info-section">
                        <h4>Servers</h4>
                        <div className="servers-list">
                            {servers.map((server, index) => (
                                <div key={index} className="server-item">
                                    <div className="server-url">
                                        <FiGlobe className="server-icon" />
                                        <a 
                                            href={formatServerUrl(server)} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="server-link"
                                        >
                                            {formatServerUrl(server)}
                                        </a>
                                    </div>
                                    {formatServerDescription(server) && (
                                        <div className="server-description">
                                            {formatServerDescription(server)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Contact Info */}
                {info?.contact && (
                    <div className="info-section">
                        <h4>Contact Information</h4>
                        <div className="contact-info">
                            {info.contact.name && (
                                <div className="contact-item">
                                    <label>Name:</label>
                                    <span>{info.contact.name}</span>
                                </div>
                            )}
                            
                            {info.contact.email && (
                                <div className="contact-item">
                                    <label>Email:</label>
                                    <a href={`mailto:${info.contact.email}`} className="contact-link">
                                        <FiMail />
                                        {info.contact.email}
                                    </a>
                                </div>
                            )}
                            
                            {info.contact.url && (
                                <div className="contact-item">
                                    <label>Website:</label>
                                    <a 
                                        href={info.contact.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="contact-link"
                                    >
                                        <FiExternalLink />
                                        {info.contact.url}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* License */}
                {info?.license && (
                    <div className="info-section">
                        <h4>License</h4>
                        <div className="license-info">
                            {info.license.url ? (
                                <a 
                                    href={info.license.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="license-link"
                                >
                                    <FiExternalLink />
                                    {info.license.name || 'License'}
                                </a>
                            ) : (
                                <span>{info.license.name || 'Licensed'}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* External Documentation */}
                {externalDocs && (
                    <div className="info-section">
                        <h4>Documentation</h4>
                        <div className="external-docs">
                            <a 
                                href={externalDocs.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="docs-link"
                            >
                                <FiExternalLink />
                                {externalDocs.description || 'External Documentation'}
                            </a>
                        </div>
                    </div>
                )}

                {/* Terms of Service */}
                {info?.termsOfService && (
                    <div className="info-section">
                        <h4>Terms of Service</h4>
                        <div className="terms-info">
                            <a 
                                href={info.termsOfService} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="terms-link"
                            >
                                <FiExternalLink />
                                Terms of Service
                            </a>
                        </div>
                    </div>
                )}

                {/* API Statistics */}
                <div className="info-section">
                    <h4>API Statistics</h4>
                    <div className="api-stats">
                        <div className="stat-item">
                            <label>Total Endpoints:</label>
                            <span>{Object.keys(openApiSpec.paths || {}).length}</span>
                        </div>
                        
                        <div className="stat-item">
                            <label>Security Schemes:</label>
                            <span>{Object.keys(openApiSpec.components?.securitySchemes || {}).length}</span>
                        </div>

                        {openApiSpec.tags && (
                            <div className="stat-item">
                                <label>Tags:</label>
                                <span>{openApiSpec.tags.length}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tags */}
                {openApiSpec.tags && openApiSpec.tags.length > 0 && (
                    <div className="info-section">
                        <h4>Available Tags</h4>
                        <div className="tags-list">
                            {openApiSpec.tags.map((tag, index) => (
                                <div key={index} className="tag-item">
                                    <div className="tag-name">{tag.name}</div>
                                    {tag.description && (
                                        <div className="tag-description">{tag.description}</div>
                                    )}
                                    {tag.externalDocs && (
                                        <a 
                                            href={tag.externalDocs.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="tag-docs-link"
                                        >
                                            <FiExternalLink />
                                            {tag.externalDocs.description || 'Documentation'}
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiInfo;
