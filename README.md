# OpenAPI Tester

A clean, user-friendly frontend application for testing any OpenAPI-compliant API dynamically. This tool loads your API specification from OpenAPI JSON files or URLs and provides an intuitive interface for testing all endpoints without needing external tools like Postman.

## Features

- **Multiple Input Methods**: Load OpenAPI specs from URLs, file uploads, or direct JSON input
- **Dynamic API Loading**: Automatically fetches and parses any OpenAPI 3.0+ specification
- **Organized Sidebar**: Collapsible sections grouped by API tags, ordered as in your spec
- **Interactive Testing**: Easy-to-use forms for testing endpoints with different parameters
- **Comprehensive Authentication**: Support for all OpenAPI security schemes:
  - **API Key**: Header, query parameter, or cookie-based authentication
  - **HTTP Authentication**: Basic, Bearer (JWT), and Digest authentication
  - **OAuth 2.0**: All flows (Authorization Code, Implicit, Password, Client Credentials)
  - **OpenID Connect**: Full OIDC support with discovery
- **Smart Authentication UI**: Authorize button with modal for configuring all auth methods
- **Request & Response History**: Each endpoint remembers its last 10 requests and responses
- **Request Reuse**: Click to reuse any previous request from history
- **Real-time Response Display**: Clean JSON formatting with syntax highlighting for body and headers
- **Per-Endpoint Persistence**: Each endpoint maintains its own request/response history
- **Local Data Storage**: All user data (auth tokens, history) stored locally in browser
- **Auto-Detection**: Automatically extracts API base URL from OpenAPI specifications
- **Responsive Design**: Modern, clean UI that works on different screen sizes

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or download this repository:

   ```bash
   git clone <repository-url>
   cd openapi-tester
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:3000`

### Getting Started

Once the application loads, you have three ways to load your OpenAPI specification:

1. **URL Input**: Enter the URL to your OpenAPI JSON file (e.g., `https://api.example.com/openapi.json`)
2. **File Upload**: Upload a local OpenAPI JSON file from your computer
3. **Direct Input**: Paste your OpenAPI JSON directly into the text area

The application will automatically parse your specification and generate a testing interface.

## Usage

### 1. Loading Your API

#### Method 1: URL Input

1. Click "Load from URL"
2. Enter your OpenAPI JSON URL (e.g., `https://petstore.swagger.io/v2/swagger.json`)
3. The base API URL will be auto-detected, but you can modify it if needed
4. Click "Load Specification"

#### Method 2: File Upload

1. Click "Upload File"
2. Select your OpenAPI JSON file from your computer
3. The API base URL will be auto-detected from the file (if available) or you can enter it manually
4. Click "Load Specification"

#### Method 3: Direct Input

1. Click "Direct Input"
2. Paste your OpenAPI JSON content
3. Enter your API base URL
4. Click "Load Specification"

### 2. Authentication

The application automatically detects and supports all authentication methods defined in your OpenAPI specification:

#### Modern Authentication (Recommended)

1. Click the **"Authorize"** button in the header (appears when security schemes are detected)
2. Select the authentication method you want to configure:
   - **API Key**: Enter your API key (automatically placed in correct location: header, query, or cookie)
   - **HTTP Basic**: Enter username and password
   - **HTTP Bearer**: Enter your JWT or bearer token
   - **OAuth 2.0**: Enter your access token (view available flows and scopes)
   - **OpenID Connect**: Enter your access token from OIDC provider
3. Click "Save Authentication"

#### Legacy Token Support

For APIs without defined security schemes, use the legacy token option:

1. Click the "Auth Token" button in the header (only appears when no modern auth is detected)
2. Enter your JWT access token
3. Click "Save Token"

All authentication data is stored locally in your browser and automatically applied to requests that require it.

### 3. Testing Endpoints

1. **Select an Endpoint**: Browse the sidebar and click on any endpoint you want to test
2. **Fill Parameters**: Enter required path parameters, query parameters, and request body
3. **Send Request**: Click the "Send Request" button
4. **View Response**: See the formatted response with status code, headers, and body
5. **View History**: Check the "History" tab to see all previous requests for this endpoint
6. **Reuse Requests**: Click "Reuse" on any historical request to load it back into the form

### 4. API Documentation

Switch to the "Documentation" tab to view detailed information about each endpoint, including:

- Parameters and their types
- Required vs optional fields
- Response schemas
- Authentication requirements
- Security schemes and scopes

## Project Structure

```bash
openapi-tester/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # React components
│   │   ├── Header.js       # Top navigation with load API and auth
│   │   ├── AuthModal.js    # Authentication configuration modal
│   │   ├── Sidebar.js      # Endpoint navigation
│   │   ├── MainContent.js  # Main testing interface
│   │   └── RequestForm.js  # Form for endpoint testing
│   ├── services/
│   │   ├── api.js          # API communication layer
│   │   └── auth.js         # Authentication service
│   ├── App.js              # Main application component
│   └── index.js            # Application entry point
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Configuration

### Environment Variables

You can set default values by creating a `.env` file:

```env
REACT_APP_DEFAULT_API_URL=https://api.example.com
REACT_APP_DEFAULT_OPENAPI_URL=https://api.example.com/openapi.json
```

### Supported OpenAPI Features

This tool supports OpenAPI 3.0+ specifications and includes:

1. **All HTTP Methods**: GET, POST, PUT, PATCH, DELETE, etc.
2. **Parameter Types**: Path, query, header, and request body parameters
3. **Complete Authentication Support**:
   - API Key (header, query, cookie)
   - HTTP (Basic, Bearer, Digest)
   - OAuth 2.0 (all flows with scope support)
   - OpenID Connect
4. **Schema Validation**: Automatic form generation based on your schemas
5. **Multiple Content Types**: JSON, form data, and other content types
6. **Response Schemas**: Formatted display of response data and headers
7. **Security Requirements**: Per-operation and global security handling

## Features in Detail

### Dynamic Schema Loading

The app intelligently reads your OpenAPI specification and:

- Groups endpoints by tags (e.g., "Users", "Orders", "Authentication", etc.)
- Maintains the original order of endpoints as defined in your specification
- Generates appropriate form fields for each parameter type
- Provides example values based on your schema definitions
- Handles different content types and authentication requirements

### Smart Form Generation

For each endpoint, the app automatically:

- Creates input fields for path parameters (e.g., `{id}` in URLs)
- Adds form fields for query parameters
- Generates JSON editors for request bodies
- Validates required vs optional fields
- Provides helpful descriptions and examples

### Response Handling

Responses are displayed with:

- Color-coded status indicators (green for success, red for errors)
- Formatted JSON with syntax highlighting
- Response headers information
- Error details for debugging

## Development

### Adding New Features

The app is built with modularity in mind:

- Add new components in the `src/components` directory
- Extend API functionality in `src/services/api.js`
- Modify styling in the corresponding CSS files

### Customization

You can easily customize:

- **Colors and Themes**: Edit the CSS files to match your brand
- **Layout**: Modify the component structure as needed
- **Features**: Add new tabs, views, or functionality

## Troubleshooting

### Common Issues

1. **"Failed to load API specification"**
   - Verify the OpenAPI JSON URL is accessible and returns valid JSON
   - Check for CORS issues if loading from a different domain
   - Ensure the OpenAPI specification follows the 3.0+ format

2. **"Invalid OpenAPI specification"**
   - Validate your OpenAPI file using tools like [Swagger Editor](https://editor.swagger.io/)
   - Check that required fields like `openapi`, `info`, and `paths` are present
   - Ensure the JSON is properly formatted

3. **Authentication not working**
   - Use the "Authorize" button to configure authentication properly
   - Verify you're using the correct authentication method as defined in your OpenAPI spec
   - For API Keys: ensure the key is valid and placed in the correct location (header/query/cookie)
   - For OAuth 2.0: ensure your access token is valid and has the required scopes
   - Check that tokens haven't expired
   - Ensure the API base URL is correct

4. **Request failures**
   - Check the browser's network tab for detailed error information
   - Verify the API base URL matches your actual API endpoint
   - Ensure all required parameters are provided
   - Check for CORS configuration on your API server

### Development Tips

- Use the browser's developer tools to debug network requests
- Check the console for any JavaScript errors
- The app includes detailed error logging for API interactions

## Contributing

To contribute to this project:

1. Make your changes in the appropriate component files
2. Test thoroughly with your backend API
3. Update this README if you add new features
4. Follow the existing code style and patterns

## Technology Stack

- **React 18**: Modern React with hooks
- **React Hook Form**: Form handling and validation
- **Axios**: HTTP client for API requests
- **React Syntax Highlighter**: JSON response formatting
- **React Hot Toast**: User notifications
- **React Icons**: Icon components

This frontend provides a complete solution for testing any OpenAPI-compliant API without needing external tools like Postman. It's specifically designed to work with any API that provides an OpenAPI specification, making it a universal API testing tool.

## Data Privacy & Security

- **Local Storage Only**: All user data (authentication credentials, request history) is stored locally in your browser
- **No Server Storage**: The deployed application doesn't store any user data on the server
- **Multi-User Safe**: Each user's data is completely isolated in their own browser
- **GDPR Compliant**: No personal data is processed or stored on the server side
- **Secure by Design**: API keys and tokens never leave your browser

## Examples

### Popular APIs you can test

- **Swagger Petstore**: `https://petstore.swagger.io/v2/swagger.json`
- **JSONPlaceholder**: `https://jsonplaceholder.typicode.com/` (create your own OpenAPI spec)
- **Any API with OpenAPI documentation**

### Sample OpenAPI URLs to try

```bash
https://petstore.swagger.io/v2/swagger.json
https://api.github.com/openapi.json (if available)
https://httpbin.org/spec.json
```
