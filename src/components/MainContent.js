import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiBook, FiCode, FiPlay } from 'react-icons/fi';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { executeRequest } from '../services/api';
import { applyAuthentication, getOperationSecurity, requiresAuth } from '../services/auth';
import './MainContent.css';
import RequestForm from './RequestForm';

const MainContent = ({ selectedEndpoint, authToken, openApiSpec, requestHistory, onSaveRequest, getEndpointKey, securitySchemes, globalSecurity, authData }) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('test');
    const [responseTab, setResponseTab] = useState('body');
    const [reuseRequest, setReuseRequest] = useState(null);


    const handleExecuteRequest = async (formData) => {
        if (!selectedEndpoint) return;

        setLoading(true);

        const endpointKey = getEndpointKey(selectedEndpoint.path, selectedEndpoint.method);

        try {
            // Create request configuration
            const config = {
                url: formData.path,
                method: selectedEndpoint.method.toLowerCase(),
                headers: {},
            };

            // Add request body for applicable methods
            if (['post', 'put', 'patch'].includes(selectedEndpoint.method.toLowerCase()) && formData.body) {
                config.data = formData.body;
            }

            // Apply authentication
            const operationSecurity = getOperationSecurity(selectedEndpoint.spec, globalSecurity);
            const authenticatedConfig = applyAuthentication(config, authData, securitySchemes, operationSecurity);

            // Add legacy auth token if no modern auth is applied and token exists
            const needsAuth = requiresAuth(selectedEndpoint.spec, globalSecurity);
            if (needsAuth && authToken && !authenticatedConfig.headers.Authorization) {
                authenticatedConfig.headers.Authorization = `Bearer ${authToken}`;
            }

            const result = await executeRequest({
                path: selectedEndpoint.path,
                method: selectedEndpoint.method,
                data: formData,
                authToken,
                config: authenticatedConfig
            });

            const responseData = {
                status: result.status,
                statusText: result.statusText,
                headers: result.headers,
                data: result.data,
                success: result.status >= 200 && result.status < 300
            };

            // Save to history (this will update the current endpoint's last response)
            onSaveRequest(endpointKey, {
                path: formData.path,
                method: selectedEndpoint.method.toUpperCase(),
                body: formData.body,
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
            }, responseData);

            if (result.status >= 200 && result.status < 300) {
                toast.success(`Request successful (${result.status})`);
            } else {
                toast.error(`Request failed (${result.status})`);
            }
        } catch (error) {
            console.error('Request failed:', error);

            const errorResponse = {
                status: error.response?.status || 0,
                statusText: error.response?.statusText || 'Network Error',
                headers: error.response?.headers || {},
                data: error.response?.data || { error: error.message },
                success: false
            };

            // Save failed request to history too
            onSaveRequest(endpointKey, {
                path: formData.path,
                method: selectedEndpoint.method.toUpperCase(),
                body: formData.body,
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
            }, errorResponse);

            toast.error(error.response?.data?.detail || error.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        if (status >= 200 && status < 300) return '#10b981';
        if (status >= 400 && status < 500) return '#f59e0b';
        if (status >= 500) return '#ef4444';
        return '#6b7280';
    };

    const getCurrentEndpointHistory = () => {
        if (!selectedEndpoint) return null;
        const endpointKey = getEndpointKey(selectedEndpoint.path, selectedEndpoint.method);
        return requestHistory[endpointKey];
    };

    const handleReuseRequest = (historyEntry) => {
        // Set the request to be reused
        setReuseRequest(historyEntry.request);
        setActiveTab('test'); // Switch to test tab
        toast.success('Request loaded into form');
    };

    const getMethodColor = (method) => {
        const colors = {
            get: '#10b981',
            post: '#3b82f6',
            put: '#f59e0b',
            patch: '#8b5cf6',
            delete: '#ef4444'
        };
        return colors[method?.toLowerCase()] || '#6b7280';
    };

    if (!selectedEndpoint) {
        return (
            <div className="main-content">
                <div className="no-endpoint-selected">
                    <FiBook size={48} />
                    <h2>Welcome to Blog API Tester</h2>
                    <p>Select an endpoint from the sidebar to start testing your API</p>
                    <div className="features-list">
                        <div className="feature-item">
                            <FiPlay />
                            <span>Test API endpoints interactively</span>
                        </div>
                        <div className="feature-item">
                            <FiCode />
                            <span>View formatted responses</span>
                        </div>
                        <div className="feature-item">
                            <FiBook />
                            <span>Explore API documentation</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const { path, method, spec } = selectedEndpoint;

    return (
        <div className="main-content">
            <div className="endpoint-header">
                <div className="endpoint-title">
                    <div
                        className="method-badge"
                        style={{ backgroundColor: getMethodColor(method) }}
                    >
                        {method?.toUpperCase()}
                    </div>
                    <div className="endpoint-info">
                        <h1>{spec.summary || 'No summary'}</h1>
                        <code className="endpoint-path">{path}</code>
                    </div>
                </div>

                {spec.description && (
                    <p className="endpoint-description">{spec.description}</p>
                )}
            </div>

            <div className="content-tabs">
                <button
                    className={`tab ${activeTab === 'test' ? 'active' : ''}`}
                    onClick={() => setActiveTab('test')}
                >
                    <FiPlay />
                    Test Request
                </button>
                <button
                    className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <FiCode />
                    History ({getCurrentEndpointHistory()?.history?.length || 0})
                </button>
                <button
                    className={`tab ${activeTab === 'docs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('docs')}
                >
                    <FiBook />
                    Documentation
                </button>
            </div>

            <div className="content-body">
                {activeTab === 'test' ? (
                    <div className="test-content">
                        <div className="request-section">
                            <h3>Request</h3>
                            <RequestForm
                                endpoint={selectedEndpoint}
                                onSubmit={handleExecuteRequest}
                                loading={loading}
                                openApiSpec={openApiSpec}
                                requestHistory={getCurrentEndpointHistory()}
                                reuseRequest={reuseRequest}
                                onReuseRequestProcessed={() => setReuseRequest(null)}
                            />
                        </div>

                        {getCurrentEndpointHistory()?.lastResponse ? (
                            <div className="response-section">
                                <div className="response-header">
                                    <h3>Last Response</h3>
                                    <div className="response-status">
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(getCurrentEndpointHistory().lastResponse.status) }}
                                        >
                                            {getCurrentEndpointHistory().lastResponse.status} {getCurrentEndpointHistory().lastResponse.statusText}
                                        </span>
                                    </div>
                                </div>

                                <div className="response-content">
                                    <div className="response-tabs">
                                        <button 
                                            className={`response-tab ${responseTab === 'body' ? 'active' : ''}`}
                                            onClick={() => setResponseTab('body')}
                                        >
                                            Body
                                        </button>
                                        <button 
                                            className={`response-tab ${responseTab === 'headers' ? 'active' : ''}`}
                                            onClick={() => setResponseTab('headers')}
                                        >
                                            Headers
                                        </button>
                                    </div>

                                    <div className="response-body">
                                        {responseTab === 'body' ? (
                                            <SyntaxHighlighter
                                                language="json"
                                                style={oneLight}
                                                customStyle={{
                                                    margin: 0,
                                                    padding: '16px',
                                                    background: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                {JSON.stringify(getCurrentEndpointHistory().lastResponse.data, null, 2)}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <SyntaxHighlighter
                                                language="json"
                                                style={oneLight}
                                                customStyle={{
                                                    margin: 0,
                                                    padding: '16px',
                                                    background: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                {JSON.stringify(getCurrentEndpointHistory().lastResponse.headers, null, 2)}
                                            </SyntaxHighlighter>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="response-section">
                                <div className="response-header">
                                    <h3>Response</h3>
                                </div>
                                <div className="no-response">
                                    <FiCode size={48} />
                                    <h3>No Previous Response</h3>
                                    <p>Send your first request to see the response here.</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'history' ? (
                    <div className="history-content">
                        {getCurrentEndpointHistory()?.history?.length > 0 ? (
                            <div className="history-list">
                                <h3>Request History</h3>
                                {getCurrentEndpointHistory().history.map((entry, index) => (
                                    <div key={index} className="history-entry">
                                        <div className="history-header">
                                            <span className="history-timestamp">
                                                {new Date(entry.timestamp).toLocaleString()}
                                            </span>
                                            <div className="history-header-right">
                                                <button
                                                    className="reuse-button"
                                                    onClick={() => handleReuseRequest(entry)}
                                                    title="Reuse this request"
                                                >
                                                    <FiPlay size={14} />
                                                    Reuse
                                                </button>
                                                <span 
                                                    className="status-badge"
                                                    style={{ backgroundColor: getStatusColor(entry.response.status) }}
                                                >
                                                    {entry.response.status} {entry.response.statusText}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="history-details">
                                            <div className="history-request">
                                                <h4>Request</h4>
                                                <div className="history-method">
                                                    <span 
                                                        className="method-badge"
                                                        style={{ backgroundColor: getMethodColor(entry.request.method) }}
                                                    >
                                                        {entry.request.method}
                                                    </span>
                                                    <code>{entry.request.path}</code>
                                                </div>
                                                {entry.request.body && (
                                                    <div className="history-body">
                                                        <strong>Body:</strong>
                                                        <SyntaxHighlighter
                                                            language="json"
                                                            style={oneLight}
                                                            customStyle={{
                                                                margin: '8px 0',
                                                                padding: '12px',
                                                                background: '#f8fafc',
                                                                border: '1px solid #e2e8f0',
                                                                borderRadius: '6px',
                                                                fontSize: '12px',
                                                                maxHeight: '200px',
                                                                overflow: 'auto'
                                                            }}
                                                        >
                                                            {JSON.stringify(entry.request.body, null, 2)}
                                                        </SyntaxHighlighter>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="history-response">
                                                <h4>Response</h4>
                                                <SyntaxHighlighter
                                                    language="json"
                                                    style={oneLight}
                                                    customStyle={{
                                                        margin: '8px 0',
                                                        padding: '12px',
                                                        background: '#f8fafc',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        maxHeight: '200px',
                                                        overflow: 'auto'
                                                    }}
                                                >
                                                    {JSON.stringify(entry.response.data, null, 2)}
                                                </SyntaxHighlighter>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-history">
                                <FiCode size={48} />
                                <h3>No Request History</h3>
                                <p>Make your first request to see it appear here.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="docs-content">
                        <div className="docs-section">
                            <h3>Endpoint Information</h3>
                            <div className="docs-item">
                                <strong>Operation ID:</strong> {spec.operationId || 'Not specified'}
                            </div>

                            {spec.security && (
                                <div className="docs-item">
                                    <strong>Security:</strong> Requires authentication
                                </div>
                            )}
                        </div>

                        {spec.parameters && (
                            <div className="docs-section">
                                <h3>Parameters</h3>
                                <div className="parameters-list">
                                    {spec.parameters.map((param, index) => (
                                        <div key={index} className="parameter-item">
                                            <div className="parameter-header">
                                                <span className="parameter-name">{param.name}</span>
                                                <span className="parameter-location">{param.in}</span>
                                                {param.required && <span className="parameter-required">required</span>}
                                            </div>
                                            <div className="parameter-description">
                                                {param.description || 'No description'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {spec.responses && (
                            <div className="docs-section">
                                <h3>Responses</h3>
                                <div className="responses-list">
                                    {Object.entries(spec.responses).map(([status, response]) => (
                                        <div key={status} className="response-item">
                                            <div className="response-status-header">
                                                <span className="response-status-code">{status}</span>
                                                <span className="response-description">
                                                    {response.description || 'No description'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainContent;
