# Quick Setup Guide

## 🚀 Getting Started

1. **Start the frontend**:

   ```bash
   # From this directory (openapi-tester)
   npm install
   npm start
   ```

2. **Open your browser**:
   The app will automatically open at `http://localhost:3000`

3. **Load your API specification**:
   Click "Load API" in the header and choose one of three options:
   - **From URL**: Enter your OpenAPI JSON URL
   - **Upload File**: Select a local OpenAPI JSON file
   - **Direct Input**: Paste your OpenAPI JSON content

## 🔑 Authentication

### Modern Authentication (Recommended)

1. Click **"Authorize"** in the header (appears when security schemes are detected)
2. Choose your authentication method:
   - **API Key**: Enter your key (auto-placed in header/query/cookie)
   - **HTTP Basic**: Enter username & password
   - **HTTP Bearer**: Enter your JWT/bearer token
   - **OAuth 2.0**: Enter access token (view flows & scopes)
   - **OpenID Connect**: Enter OIDC access token
3. Click "Save Authentication"

### Legacy Token (Fallback)

1. Click "Auth Token" in the header (only shows when no modern auth detected)
2. Enter your JWT access token
3. Click "Save Token"

All auth data is stored locally in your browser! 🔒

## ✨ Features

- **Multiple Input Methods**: Load specs from URLs, files, or direct input
- **Auto Base URL Detection**: Automatically extracts API base URL from specs
- **Dynamic Loading**: Automatically parses any OpenAPI 3.0+ specification
- **Smart Forms**: Generates forms based on your OpenAPI schema
- **Live Testing**: Test any endpoint with real requests
- **Request History**: Each endpoint remembers its last 10 requests
- **Request Reuse**: Click to reuse any previous request
- **Response Viewer**: Formatted JSON responses with syntax highlighting
- **Complete Authentication**: Supports all OpenAPI security schemes:
  - API Key (header/query/cookie)
  - HTTP (Basic/Bearer/Digest)
  - OAuth 2.0 (all flows)
  - OpenID Connect
- **Local Data Storage**: All your data stays in your browser

## 🌐 Example APIs to Try

- **Swagger Petstore**: `https://petstore.swagger.io/v2/swagger.json`

## 🛠️ Troubleshooting

- **Spec loading failed**: Check that the URL returns valid JSON and is accessible
- **File upload issues**: Ensure you're uploading a valid OpenAPI JSON file
- **CORS errors**: The API server needs to allow requests from localhost:3000
- **Auth not working**: Use the "Authorize" button for proper authentication setup
- **Token issues**: Make sure your tokens are valid and not expired
- **Request failures**: Verify the API base URL is correct (auto-detected or manual)

Enjoy testing any OpenAPI-compliant API! 🎉
