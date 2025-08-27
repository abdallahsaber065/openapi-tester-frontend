import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiLoader, FiPlay } from 'react-icons/fi';
import './RequestForm.css';

const RequestForm = ({ endpoint, onSubmit, loading, openApiSpec, requestHistory, reuseRequest, onReuseRequestProcessed }) => {
    const { handleSubmit, reset } = useForm();
    const [requestBody, setRequestBody] = useState('');
    const [pathParams, setPathParams] = useState({});
    const [queryParams, setQueryParams] = useState({});

    useEffect(() => {
        reset();
        setRequestBody('');
        setPathParams({});
        setQueryParams({});

        // Pre-fill with last request data if available
        if (requestHistory?.lastRequest) {
            const lastReq = requestHistory.lastRequest;
            
            // Extract path parameters from last request
            if (lastReq.path !== endpoint.path) {
                const pathParts = lastReq.path.split('?')[0].split('/');
                const endpointParts = endpoint.path.split('/');
                
                const extractedParams = {};
                endpointParts.forEach((part, index) => {
                    if (part.startsWith('{') && part.endsWith('}')) {
                        const paramName = part.slice(1, -1);
                        if (pathParts[index]) {
                            extractedParams[paramName] = decodeURIComponent(pathParts[index]);
                        }
                    }
                });
                setPathParams(extractedParams);
            }

            // Extract query parameters
            if (lastReq.path.includes('?')) {
                const queryString = lastReq.path.split('?')[1];
                const queryParamsFromUrl = new URLSearchParams(queryString);
                const extractedQuery = {};
                queryParamsFromUrl.forEach((value, key) => {
                    extractedQuery[key] = value;
                });
                setQueryParams(extractedQuery);
            }

            // Set request body
            if (lastReq.body) {
                setRequestBody(JSON.stringify(lastReq.body, null, 2));
            }
        } else if (endpoint?.spec?.requestBody) {
            // Fall back to example data if no history
            generateExampleRequestBody();
        }
    }, [endpoint, requestHistory]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle reuse request
    useEffect(() => {
        if (reuseRequest && endpoint) {
            // Extract path parameters from reuse request
            const pathParts = reuseRequest.path.split('?')[0].split('/');
            const endpointParts = endpoint.path.split('/');
            
            const extractedParams = {};
            endpointParts.forEach((part, index) => {
                if (part.startsWith('{') && part.endsWith('}')) {
                    const paramName = part.slice(1, -1);
                    if (pathParts[index]) {
                        extractedParams[paramName] = decodeURIComponent(pathParts[index]);
                    }
                }
            });
            setPathParams(extractedParams);

            // Extract query parameters
            if (reuseRequest.path.includes('?')) {
                const queryString = reuseRequest.path.split('?')[1];
                const queryParamsFromUrl = new URLSearchParams(queryString);
                const extractedQuery = {};
                queryParamsFromUrl.forEach((value, key) => {
                    extractedQuery[key] = value;
                });
                setQueryParams(extractedQuery);
            } else {
                setQueryParams({});
            }

            // Set request body
            if (reuseRequest.body) {
                setRequestBody(JSON.stringify(reuseRequest.body, null, 2));
            } else {
                setRequestBody('');
            }

            // Notify that we've processed the reuse request
            onReuseRequestProcessed();
        }
    }, [reuseRequest, endpoint, onReuseRequestProcessed]);

    const generateExampleRequestBody = () => {
        const requestBodySpec = endpoint.spec.requestBody;
        const contentType = 'application/json';

        if (requestBodySpec?.content?.[contentType]?.schema) {
            const schema = requestBodySpec.content[contentType].schema;
            const example = generateExampleFromSchema(schema);
            setRequestBody(JSON.stringify(example, null, 2));
        }
    };

    const generateExampleFromSchema = (schema) => {
        if (schema.$ref) {
            // Resolve reference
            const refPath = schema.$ref.replace('#/components/schemas/', '');
            const resolvedSchema = openApiSpec?.components?.schemas?.[refPath];
            if (resolvedSchema) {
                return generateExampleFromSchema(resolvedSchema);
            }
        }

        if (schema.type === 'object' && schema.properties) {
            const example = {};
            Object.entries(schema.properties).forEach(([key, prop]) => {
                if (schema.required?.includes(key) || Math.random() > 0.5) {
                    example[key] = generateExampleFromSchema(prop);
                }
            });
            return example;
        }

        switch (schema.type) {
            case 'string':
                if (schema.format === 'email') return 'user@example.com';
                if (schema.format === 'date-time') return new Date().toISOString();
                if (schema.format === 'password') return 'password123';
                return schema.example || 'string';
            case 'integer':
                return schema.example || 123;
            case 'number':
                return schema.example || 123.45;
            case 'boolean':
                return schema.example !== undefined ? schema.example : true;
            case 'array':
                return [generateExampleFromSchema(schema.items || { type: 'string' })];
            default:
                return schema.example || null;
        }
    };

    const extractPathParameters = () => {
        const pathParamRegex = /{([^}]+)}/g;
        const matches = [...endpoint.path.matchAll(pathParamRegex)];
        return matches.map(match => match[1]);
    };

    const getQueryParameters = () => {
        return endpoint.spec.parameters?.filter(param => param.in === 'query') || [];
    };

    const getRequestBodySchema = () => {
        const requestBodySpec = endpoint.spec.requestBody;
        if (!requestBodySpec) return null;

        const contentType = 'application/json';
        return requestBodySpec.content?.[contentType]?.schema;
    };

    const onFormSubmit = (data) => {
        let body = null;

        // Handle request body
        if (requestBody.trim()) {
            try {
                body = JSON.parse(requestBody);
            } catch (error) {
                alert('Invalid JSON in request body');
                return;
            }
        }

        // Build path with parameters
        let finalPath = endpoint.path;
        Object.entries(pathParams).forEach(([key, value]) => {
            finalPath = finalPath.replace(`{${key}}`, encodeURIComponent(value));
        });

        // Build query parameters
        const queryString = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                queryString.append(key, value);
            }
        });

        const fullPath = finalPath + (queryString.toString() ? `?${queryString.toString()}` : '');

        onSubmit({
            path: fullPath,
            body
        });
    };

    const pathParamNames = extractPathParameters();
    const queryParamSpecs = getQueryParameters();
    const requestBodySchema = getRequestBodySchema();

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="request-form">
            {/* Path Parameters */}
            {pathParamNames.length > 0 && (
                <div className="form-section">
                    <h4>Path Parameters</h4>
                    <div className="form-grid">
                        {pathParamNames.map(paramName => (
                            <div key={paramName} className="form-field">
                                <label>
                                    {paramName} <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={pathParams[paramName] || ''}
                                    onChange={(e) => setPathParams(prev => ({ ...prev, [paramName]: e.target.value }))}
                                    placeholder={`Enter ${paramName}`}
                                    required
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Query Parameters */}
            {queryParamSpecs.length > 0 && (
                <div className="form-section">
                    <h4>Query Parameters</h4>
                    <div className="form-grid">
                        {queryParamSpecs.map(param => (
                            <div key={param.name} className="form-field">
                                <label>
                                    {param.name}
                                    {param.required && <span className="required">*</span>}
                                </label>
                                <input
                                    type={param.schema?.type === 'integer' ? 'number' : 'text'}
                                    value={queryParams[param.name] || ''}
                                    onChange={(e) => setQueryParams(prev => ({ ...prev, [param.name]: e.target.value }))}
                                    placeholder={param.description || `Enter ${param.name}`}
                                    required={param.required}
                                />
                                {param.description && (
                                    <div className="field-description">{param.description}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Request Body */}
            {requestBodySchema && (
                <div className="form-section">
                    <h4>Request Body</h4>
                    <div className="json-editor">
                        <textarea
                            value={requestBody}
                            onChange={(e) => setRequestBody(e.target.value)}
                            placeholder="Enter JSON request body"
                            rows={8}
                            className="json-textarea"
                        />
                        <div className="json-help">
                            <span>Format: JSON</span>
                            <button
                                type="button"
                                onClick={generateExampleRequestBody}
                                className="generate-example-btn"
                            >
                                Generate Example
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Notice */}
            {endpoint.spec.security && (
                <div className="security-notice">
                    <span>🔐 This endpoint requires authentication</span>
                </div>
            )}

            {/* Submit Button */}
            <div className="form-actions">
                <button
                    type="submit"
                    disabled={loading}
                    className="submit-button"
                >
                    {loading ? (
                        <>
                            <FiLoader className="spin" />
                            Sending Request...
                        </>
                    ) : (
                        <>
                            <FiPlay />
                            Send Request
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default RequestForm;
