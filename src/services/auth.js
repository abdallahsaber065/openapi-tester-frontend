// Authentication service for handling various OpenAPI security schemes

export const AUTH_TYPES = {
    API_KEY: 'apiKey',
    HTTP: 'http',
    OAUTH2: 'oauth2',
    OPENID_CONNECT: 'openIdConnect'
};

export const HTTP_SCHEMES = {
    BASIC: 'basic',
    BEARER: 'bearer',
    DIGEST: 'digest'
};

export const OAUTH2_FLOWS = {
    AUTHORIZATION_CODE: 'authorizationCode',
    IMPLICIT: 'implicit',
    PASSWORD: 'password',
    CLIENT_CREDENTIALS: 'clientCredentials'
};

export const API_KEY_LOCATIONS = {
    QUERY: 'query',
    HEADER: 'header',
    COOKIE: 'cookie'
};

/**
 * Parse security schemes from OpenAPI specification
 * @param {Object} openApiSpec - The OpenAPI specification object
 * @returns {Object} Parsed security schemes
 */
export const parseSecuritySchemes = (openApiSpec) => {
    if (!openApiSpec?.components?.securitySchemes) {
        return {};
    }

    const schemes = {};
    const securitySchemes = openApiSpec.components.securitySchemes;

    Object.entries(securitySchemes).forEach(([name, scheme]) => {
        schemes[name] = {
            name,
            type: scheme.type,
            description: scheme.description || '',
            ...parseSchemeDetails(scheme)
        };
    });

    return schemes;
};

/**
 * Parse specific details for each security scheme type
 * @param {Object} scheme - Security scheme object
 * @returns {Object} Parsed scheme details
 */
const parseSchemeDetails = (scheme) => {
    switch (scheme.type) {
        case AUTH_TYPES.API_KEY:
            return {
                in: scheme.in, // query, header, or cookie
                parameterName: scheme.name
            };

        case AUTH_TYPES.HTTP:
            return {
                scheme: scheme.scheme, // basic, bearer, digest, etc.
                bearerFormat: scheme.bearerFormat // JWT, etc.
            };

        case AUTH_TYPES.OAUTH2:
            return {
                flows: scheme.flows,
                scopes: extractScopes(scheme.flows)
            };

        case AUTH_TYPES.OPENID_CONNECT:
            return {
                openIdConnectUrl: scheme.openIdConnectUrl
            };

        default:
            return {};
    }
};

/**
 * Extract all available scopes from OAuth2 flows
 * @param {Object} flows - OAuth2 flows object
 * @returns {Array} Array of scope objects
 */
const extractScopes = (flows) => {
    const allScopes = new Set();
    
    Object.values(flows || {}).forEach(flow => {
        if (flow.scopes) {
            Object.entries(flow.scopes).forEach(([scope, description]) => {
                allScopes.add(JSON.stringify({ scope, description }));
            });
        }
    });

    return Array.from(allScopes).map(scopeStr => JSON.parse(scopeStr));
};

/**
 * Get global security requirements from OpenAPI spec
 * @param {Object} openApiSpec - The OpenAPI specification object
 * @returns {Array} Array of security requirements
 */
export const getGlobalSecurity = (openApiSpec) => {
    return openApiSpec?.security || [];
};

/**
 * Get security requirements for a specific operation
 * @param {Object} operationSpec - The operation specification
 * @param {Object} globalSecurity - Global security requirements
 * @returns {Array} Array of security requirements for the operation
 */
export const getOperationSecurity = (operationSpec, globalSecurity) => {
    // Operation-level security overrides global security
    if (operationSpec.security !== undefined) {
        return operationSpec.security;
    }
    return globalSecurity;
};

/**
 * Check if an operation requires authentication
 * @param {Object} operationSpec - The operation specification
 * @param {Array} globalSecurity - Global security requirements
 * @returns {boolean} True if authentication is required
 */
export const requiresAuth = (operationSpec, globalSecurity) => {
    const security = getOperationSecurity(operationSpec, globalSecurity);
    return security && security.length > 0 && security.some(req => Object.keys(req).length > 0);
};

/**
 * Apply authentication to request configuration
 * @param {Object} config - Axios request configuration
 * @param {Object} authData - Authentication data
 * @param {Object} securitySchemes - Available security schemes
 * @param {Array} requiredSecurity - Required security for the operation
 * @returns {Object} Updated request configuration
 */
export const applyAuthentication = (config, authData, securitySchemes, requiredSecurity) => {
    if (!requiredSecurity || requiredSecurity.length === 0) {
        return config;
    }

    // Apply the first matching security requirement
    for (const securityReq of requiredSecurity) {
        const applied = applySecurityRequirement(config, authData, securitySchemes, securityReq);
        if (applied) {
            return config;
        }
    }

    return config;
};

/**
 * Apply a specific security requirement to the request
 * @param {Object} config - Axios request configuration
 * @param {Object} authData - Authentication data
 * @param {Object} securitySchemes - Available security schemes
 * @param {Object} securityReq - Security requirement object
 * @returns {boolean} True if authentication was applied
 */
const applySecurityRequirement = (config, authData, securitySchemes, securityReq) => {
    let applied = false;

    for (const [schemeName, scopes] of Object.entries(securityReq)) {
        const scheme = securitySchemes[schemeName];
        const auth = authData[schemeName];

        if (!scheme || !auth) {
            continue;
        }

        switch (scheme.type) {
            case AUTH_TYPES.API_KEY:
                applied = applyApiKeyAuth(config, auth, scheme) || applied;
                break;

            case AUTH_TYPES.HTTP:
                applied = applyHttpAuth(config, auth, scheme) || applied;
                break;

            case AUTH_TYPES.OAUTH2:
                applied = applyOAuth2Auth(config, auth, scheme, scopes) || applied;
                break;

            case AUTH_TYPES.OPENID_CONNECT:
                applied = applyOpenIdConnectAuth(config, auth, scheme) || applied;
                break;

            default:
                console.warn(`Unsupported security scheme type: ${scheme.type}`);
                break;
        }
    }

    return applied;
};

/**
 * Apply API Key authentication
 * @param {Object} config - Request configuration
 * @param {Object} auth - Auth data
 * @param {Object} scheme - Security scheme
 * @returns {boolean} True if applied
 */
const applyApiKeyAuth = (config, auth, scheme) => {
    if (!auth.value) return false;

    switch (scheme.in) {
        case API_KEY_LOCATIONS.HEADER:
            config.headers = config.headers || {};
            config.headers[scheme.parameterName] = auth.value;
            break;

        case API_KEY_LOCATIONS.QUERY:
            config.params = config.params || {};
            config.params[scheme.parameterName] = auth.value;
            break;

        case API_KEY_LOCATIONS.COOKIE:
            config.headers = config.headers || {};
            config.headers['Cookie'] = `${scheme.parameterName}=${auth.value}`;
            break;

        default:
            return false;
    }

    return true;
};

/**
 * Apply HTTP authentication
 * @param {Object} config - Request configuration
 * @param {Object} auth - Auth data
 * @param {Object} scheme - Security scheme
 * @returns {boolean} True if applied
 */
const applyHttpAuth = (config, auth, scheme) => {
    config.headers = config.headers || {};

            switch (scheme.scheme.toLowerCase()) {
        case HTTP_SCHEMES.BASIC:
            if (!auth.username || !auth.password) return false;
            const credentials = btoa(`${auth.username}:${auth.password}`);
            config.headers['Authorization'] = `Basic ${credentials}`;
            break;

        case HTTP_SCHEMES.BEARER:
            if (!auth.token) return false;
            config.headers['Authorization'] = `Bearer ${auth.token}`;
            break;

        case HTTP_SCHEMES.DIGEST:
            // Digest auth is complex and typically handled by the HTTP client
            if (!auth.username || !auth.password) return false;
            // Note: Full digest implementation would require challenge-response
            console.warn('Digest authentication requires server challenge. Using basic fallback.');
            const digestCredentials = btoa(`${auth.username}:${auth.password}`);
            config.headers['Authorization'] = `Basic ${digestCredentials}`;
            break;

        default:
            console.warn(`Unsupported HTTP auth scheme: ${scheme.scheme}`);
            return false;
    }

    return true;
};

/**
 * Apply OAuth2 authentication
 * @param {Object} config - Request configuration
 * @param {Object} auth - Auth data
 * @param {Object} scheme - Security scheme
 * @param {Array} scopes - Required scopes
 * @returns {boolean} True if applied
 */
const applyOAuth2Auth = (config, auth, scheme, scopes) => {
    if (!auth.accessToken) return false;

    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${auth.accessToken}`;

    return true;
};

/**
 * Apply OpenID Connect authentication
 * @param {Object} config - Request configuration
 * @param {Object} auth - Auth data
 * @param {Object} scheme - Security scheme
 * @returns {boolean} True if applied
 */
const applyOpenIdConnectAuth = (config, auth, scheme) => {
    if (!auth.accessToken) return false;

    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${auth.accessToken}`;

    return true;
};

/**
 * Validate authentication data for a scheme
 * @param {Object} auth - Auth data
 * @param {Object} scheme - Security scheme
 * @returns {Object} Validation result
 */
export const validateAuth = (auth, scheme) => {
    const errors = [];

    switch (scheme.type) {
        case AUTH_TYPES.API_KEY:
            if (!auth.value) {
                errors.push(`${scheme.parameterName} is required`);
            }
            break;

        case AUTH_TYPES.HTTP:
            if (scheme.scheme === HTTP_SCHEMES.BASIC) {
                if (!auth.username) errors.push('Username is required');
                if (!auth.password) errors.push('Password is required');
            } else if (scheme.scheme === HTTP_SCHEMES.BEARER) {
                if (!auth.token) errors.push('Bearer token is required');
            }
            break;

        case AUTH_TYPES.OAUTH2:
            if (!auth.accessToken) {
                errors.push('Access token is required');
            }
            break;

        case AUTH_TYPES.OPENID_CONNECT:
            if (!auth.accessToken) {
                errors.push('Access token is required');
            }
            break;

        default:
            errors.push(`Unsupported authentication type: ${scheme.type}`);
            break;
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
