import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Sidebar from './components/Sidebar';
import { fetchOpenAPISpec } from './services/api';

function App() {
    const [openApiSpec, setOpenApiSpec] = useState(null);
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || '');
    const [requestHistory, setRequestHistory] = useState(() => {
        const saved = localStorage.getItem('requestHistory');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        loadOpenAPISpec();
    }, []);

    const loadOpenAPISpec = async () => {
        try {
            setLoading(true);
            setError(null);
            const spec = await fetchOpenAPISpec();
            setOpenApiSpec(spec);

            // Auto-select first endpoint
            const firstTag = Object.keys(spec.paths)[0];
            if (firstTag) {
                const firstMethod = Object.keys(spec.paths[firstTag])[0];
                setSelectedEndpoint({
                    path: firstTag,
                    method: firstMethod,
                    spec: spec.paths[firstTag][firstMethod]
                });
            }
        } catch (err) {
            setError('Failed to load API specification. Make sure the backend is running.');
            console.error('Failed to load OpenAPI spec:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEndpointSelect = (path, method, spec) => {
        setSelectedEndpoint({ path, method, spec });
    };

    const handleAuthTokenChange = (token) => {
        setAuthToken(token);
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    };

    const saveRequestToHistory = (endpointKey, request, response) => {
        const timestamp = new Date().toISOString();
        const historyEntry = {
            request,
            response,
            timestamp
        };

        setRequestHistory(prev => {
            const updated = {
                ...prev,
                [endpointKey]: {
                    ...prev[endpointKey],
                    lastRequest: request,
                    lastResponse: response,
                    history: [
                        historyEntry,
                        ...(prev[endpointKey]?.history || []).slice(0, 9) // Keep last 10 requests
                    ]
                }
            };
            localStorage.setItem('requestHistory', JSON.stringify(updated));
            return updated;
        });
    };

    const getEndpointKey = (path, method) => {
        return `${method.toUpperCase()}:${path}`;
    };

    return (
        <div className="app">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />

            <Header
                onRefresh={loadOpenAPISpec}
                authToken={authToken}
                onAuthTokenChange={handleAuthTokenChange}
            />

            <div className="app-content">
                <Sidebar
                    openApiSpec={openApiSpec}
                    selectedEndpoint={selectedEndpoint}
                    onEndpointSelect={handleEndpointSelect}
                    loading={loading}
                    error={error}
                />

                <MainContent
                    selectedEndpoint={selectedEndpoint}
                    authToken={authToken}
                    openApiSpec={openApiSpec}
                    requestHistory={requestHistory}
                    onSaveRequest={saveRequestToHistory}
                    getEndpointKey={getEndpointKey}
                />
            </div>
        </div>
    );
}

export default App;
