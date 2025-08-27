import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import './App.css';
import AuthModal from './components/AuthModal';

import Header from './components/Header';
import MainContent from './components/MainContent';
import Sidebar from './components/Sidebar';
import { parseSecuritySchemes, getGlobalSecurity } from './services/auth';
import { fetchOpenAPISpec, setApiBaseUrl } from './services/api';

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
    
    // New authentication state
    const [securitySchemes, setSecuritySchemes] = useState({});
    const [globalSecurity, setGlobalSecurity] = useState([]);
    const [authData, setAuthData] = useState(() => {
        const saved = localStorage.getItem('authData');
        return saved ? JSON.parse(saved) : {};
    });
    const [showAuthModal, setShowAuthModal] = useState(false);

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
            setError('Failed to load API specification. Please load a specification using the "Load API" button.');
            console.error('Failed to load OpenAPI spec:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadSpec = async (specData, apiBaseUrl) => {
        try {
            setLoading(true);
            setError(null);
            setSelectedEndpoint(null);
            
            // Set the API base URL
            setApiBaseUrl(apiBaseUrl);
            
            // Set the spec data
            setOpenApiSpec(specData);

            // Parse security schemes
            const schemes = parseSecuritySchemes(specData);
            setSecuritySchemes(schemes);
            
            // Get global security requirements
            const globalSec = getGlobalSecurity(specData);
            setGlobalSecurity(globalSec);

            // Auto-select first endpoint
            const firstTag = Object.keys(specData.paths)[0];
            if (firstTag) {
                const firstMethod = Object.keys(specData.paths[firstTag])[0];
                setSelectedEndpoint({
                    path: firstTag,
                    method: firstMethod,
                    spec: specData.paths[firstTag][firstMethod]
                });
            }
            
            toast.success('API specification loaded successfully!');
        } catch (err) {
            setError('Failed to process API specification.');
            console.error('Failed to process OpenAPI spec:', err);
            toast.error('Failed to load API specification');
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

    const handleAuthUpdate = (newAuthData) => {
        setAuthData(newAuthData);
        localStorage.setItem('authData', JSON.stringify(newAuthData));
        toast.success('Authentication updated successfully!');
    };

    const getAuthenticatedSchemeCount = () => {
        return Object.entries(authData).filter(([_, auth]) => 
            auth && Object.values(auth).some(val => val && val.trim())
        ).length;
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
                onLoadSpec={handleLoadSpec}
                onShowAuth={() => setShowAuthModal(true)}
                securitySchemes={securitySchemes}
                authData={authData}
                authenticatedCount={getAuthenticatedSchemeCount()}
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
                    securitySchemes={securitySchemes}
                    globalSecurity={globalSecurity}
                    authData={authData}
                />
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                securitySchemes={securitySchemes}
                authData={authData}
                onAuthUpdate={handleAuthUpdate}
            />
        </div>
    );
}

export default App;
