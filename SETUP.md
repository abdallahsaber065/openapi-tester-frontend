# Quick Setup Guide

## 🚀 Getting Started

1. **Make sure your backend is running**:

   ```bash
   # From the backend directory
   python main.py
   ```

   Your API should be accessible at `http://localhost:8000`

2. **Start the frontend**:

   ```bash
   # From this directory (test-frontend)
   npm start
   ```

   Or double-click `start.bat` on Windows

3. **Open your browser**:
   The app will automatically open at `http://localhost:3000`

## 🔑 Authentication

1. First, register or login through your API to get a token
2. Click "Auth Token" in the header
3. Paste your JWT token
4. Now you can test authenticated endpoints!

## ✨ Features

- **Dynamic Loading**: Automatically loads your API spec from `/api/v1/openapi.json`
- **Smart Forms**: Generates forms based on your OpenAPI schema
- **Live Testing**: Test any endpoint with real requests
- **Response Viewer**: Formatted JSON responses with syntax highlighting
- **Authentication**: Built-in JWT token management

## 🛠️ Troubleshooting

- **Backend not found**: Make sure your API is running on port 8000
- **CORS errors**: Check your FastAPI CORS settings
- **Token issues**: Make sure your JWT token is valid and not expired

Enjoy testing your API! 🎉
