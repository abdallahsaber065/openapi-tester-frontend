# Blog API Tester

A clean, user-friendly frontend application for testing the Blog API endpoints dynamically. This tool automatically loads your API specification from the OpenAPI JSON endpoint and provides an intuitive interface for testing all endpoints.

## Features

- **Dynamic API Loading**: Automatically fetches and parses your OpenAPI specification
- **Organized Sidebar**: Collapsible sections grouped by API tags
- **Interactive Testing**: Easy-to-use forms for testing endpoints with different parameters
- **Authentication Support**: Built-in JWT token management
- **Request & Response Display**: Clean JSON formatting with syntax highlighting
- **Real-time Updates**: Automatically refreshes API spec when your backend changes
- **Responsive Design**: Modern, clean UI that works on different screen sizes

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Your Blog API backend running on `http://localhost:8000`

### Installation

1. Navigate to the test-frontend directory:

   ```bash
   cd test-frontend
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

The application will automatically connect to your backend API at `http://localhost:8000` and load the OpenAPI specification.

## Usage

### 1. Authentication

If your API endpoints require authentication:

1. Click the "Auth Token" button in the header
2. Enter your JWT access token (you can get this by logging in through your API)
3. Click "Save Token"

The token will be automatically included in all subsequent requests that require authentication.

### 2. Testing Endpoints

1. **Select an Endpoint**: Browse the sidebar and click on any endpoint you want to test
2. **Fill Parameters**: Enter required path parameters, query parameters, and request body
3. **Send Request**: Click the "Send Request" button
4. **View Response**: See the formatted response with status code, headers, and body

### 3. API Documentation

Switch to the "Documentation" tab to view detailed information about each endpoint, including:

- Parameters and their types
- Required vs optional fields
- Response schemas
- Authentication requirements

## Project Structure

```bash
test-frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # React components
│   │   ├── Header.js       # Top navigation with auth
│   │   ├── Sidebar.js      # Endpoint navigation
│   │   ├── MainContent.js  # Main testing interface
│   │   └── RequestForm.js  # Form for endpoint testing
│   ├── services/
│   │   └── api.js          # API communication layer
│   ├── App.js              # Main application component
│   └── index.js            # Application entry point
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Configuration

### Environment Variables

You can customize the backend URL by creating a `.env` file:

```env
REACT_APP_API_URL=http://localhost:8000
```

### API Integration

The application automatically integrates with your Blog API by:

1. Fetching the OpenAPI specification from `/api/v1/openapi.json`
2. Parsing endpoint definitions, parameters, and schemas
3. Generating forms based on your API schema
4. Providing authentication headers when needed

## Features in Detail

### Dynamic Schema Loading

The app intelligently reads your OpenAPI specification and:

- Groups endpoints by tags (e.g., "Authentication", "Posts", etc.)
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
   - Make sure your backend is running on `http://localhost:8000`
   - Check that the `/api/v1/openapi.json` endpoint is accessible
   - Verify CORS settings in your backend

2. **Authentication not working**
   - Ensure you're using a valid JWT token
   - Check that the token hasn't expired
   - Verify your backend accepts `Bearer` token authentication

3. **Request failures**
   - Check the browser's network tab for detailed error information
   - Verify the request format matches your API expectations
   - Ensure all required parameters are provided

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

This frontend provides a complete solution for testing your Blog API without needing external tools like Postman, while being specifically tailored to your API's structure and requirements.
