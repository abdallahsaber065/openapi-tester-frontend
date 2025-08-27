import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { FiAlertCircle, FiChevronDown, FiChevronRight, FiLoader } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ openApiSpec, selectedEndpoint, onEndpointSelect, loading, error }) => {
    const [expandedSections, setExpandedSections] = useState(new Set(['Authentication']));
    const [groupedEndpoints, setGroupedEndpoints] = useState({});

    useEffect(() => {
        if (openApiSpec?.paths) {
            groupEndpointsByTag();
        }
    }, [openApiSpec]); // eslint-disable-line react-hooks/exhaustive-deps

    const groupEndpointsByTag = () => {
        const grouped = {};
        const pathOrder = Object.keys(openApiSpec.paths);

        // Group endpoints by tag while preserving original order
        pathOrder.forEach((path) => {
            const methods = openApiSpec.paths[path];
            // Preserve method order as they appear in the spec
            Object.entries(methods).forEach(([method, spec]) => {
                const tags = spec.tags || ['Untagged'];

                tags.forEach(tag => {
                    if (!grouped[tag]) {
                        grouped[tag] = [];
                    }

                    grouped[tag].push({
                        path,
                        method: method.toUpperCase(),
                        spec,
                        summary: spec.summary || 'No summary',
                        description: spec.description || '',
                        operationId: spec.operationId || '',
                        originalPathIndex: pathOrder.indexOf(path),
                        originalMethodOrder: Object.keys(methods).indexOf(method)
                    });
                });
            });
        });

        // Sort endpoints within each tag by original order
        Object.keys(grouped).forEach(tag => {
            grouped[tag].sort((a, b) => {
                // First by path order in original spec
                if (a.originalPathIndex !== b.originalPathIndex) {
                    return a.originalPathIndex - b.originalPathIndex;
                }
                // Then by method order within the same path
                return a.originalMethodOrder - b.originalMethodOrder;
            });
        });

        setGroupedEndpoints(grouped);
    };

    const toggleSection = (section) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const getMethodColor = (method) => {
        const colors = {
            GET: '#10b981',
            POST: '#3b82f6',
            PUT: '#f59e0b',
            PATCH: '#8b5cf6',
            DELETE: '#ef4444'
        };
        return colors[method] || '#6b7280';
    };

    const isEndpointSelected = (path, method) => {
        return selectedEndpoint?.path === path &&
            selectedEndpoint?.method?.toLowerCase() === method.toLowerCase();
    };

    if (loading) {
        return (
            <div className="sidebar">
                <div className="sidebar-loading">
                    <FiLoader className="spin" size={24} />
                    <p>Loading API specification...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="sidebar">
                <div className="sidebar-error">
                    <FiAlertCircle size={24} />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>API Endpoints</h2>
                <span className="endpoint-count">
                    {Object.values(groupedEndpoints).reduce((acc, endpoints) => acc + endpoints.length, 0)} endpoints
                </span>
            </div>

            <div className="sidebar-content">
                {Object.entries(groupedEndpoints).map(([tag, endpoints]) => (
                    <div key={tag} className="endpoint-section">
                        <button
                            className="section-header"
                            onClick={() => toggleSection(tag)}
                        >
                            <div className="section-header-content">
                                {expandedSections.has(tag) ? <FiChevronDown /> : <FiChevronRight />}
                                <span className="section-title">{tag}</span>
                                <span className="section-count">{endpoints.length}</span>
                            </div>
                        </button>

                        {expandedSections.has(tag) && (
                            <div className="endpoint-list">
                                {endpoints.map((endpoint, index) => (
                                    <button
                                        key={`${endpoint.path}-${endpoint.method}`}
                                        className={classNames('endpoint-item', {
                                            'selected': isEndpointSelected(endpoint.path, endpoint.method)
                                        })}
                                        onClick={() => onEndpointSelect(endpoint.path, endpoint.method.toLowerCase(), endpoint.spec)}
                                    >
                                        <div className="endpoint-method-badge" style={{ backgroundColor: getMethodColor(endpoint.method) }}>
                                            {endpoint.method}
                                        </div>

                                        <div className="endpoint-details">
                                            <div className="endpoint-path">{endpoint.path}</div>
                                            <div className="endpoint-summary">{endpoint.summary}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {Object.keys(groupedEndpoints).length === 0 && (
                    <div className="no-endpoints">
                        <p>No endpoints found in the API specification.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
