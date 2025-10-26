# Supernal Coding Dashboard

This is the integrated dashboard system for Supernal Coding, providing real-time project metrics and requirement tracking.

## 🚀 Quick Start

### Option 1: Start Dashboard Only
```bash
npm run start:dashboard
```
This starts only the dashboard API server on port 3001.

### Option 2: Start Documentation + Dashboard
```bash
npm run start:with-dashboard
```
This starts both the documentation server and the dashboard API server concurrently.

## 📊 Dashboard Features

- **Real-time Progress Tracking**: Live updates on requirement completion
- **Priority Distribution**: Visual breakdown of critical, high, medium, and low priority items
- **Requirement Status**: Current status of all project requirements
- **Auto-refresh**: Data updates automatically every 30 seconds
- **API Integration**: RESTful API endpoints for data access

## 🔌 API Endpoints

The dashboard provides the following API endpoints:

- `GET /api/requirements` - Get all requirements with metadata
- `GET /api/stats` - Get dashboard statistics and progress metrics
- `GET /api/kanban` - Get kanban board data
- `GET /api/kanban/stats` - Get kanban statistics
- `GET /api/hierarchy` - Get requirement-task hierarchy
- `GET /api/health` - Health check endpoint

## 🏗️ Architecture

The dashboard consists of:

1. **API Server** (`server.js`): Express server providing REST endpoints
2. **Frontend** (`index.html`): Static HTML dashboard with JavaScript
3. **Integration** (`dashboard.tsx`): Docusaurus page embedding the dashboard

## 🔧 Configuration

The dashboard automatically detects:
- Requirements directory from project configuration
- Kanban directory from project configuration
- Project root for proper file scanning

## 📁 File Structure

```
documentation/static/dashboard/
├── server.js          # API server
├── index.html         # Dashboard frontend
├── src/               # Dashboard source files
│   └── services/      # Dashboard services
└── README.md          # This file
```

## 🚨 Troubleshooting

### Dashboard Not Loading
1. Ensure the dashboard API server is running on port 3001
2. Check that the project has requirements in the correct directory
3. Verify the configuration is properly loaded

### API Errors
1. Check the server logs for detailed error messages
2. Ensure all required dependencies are installed
3. Verify file permissions for the project directories

### CORS Issues
The dashboard server includes CORS middleware to allow cross-origin requests from the documentation site.

## 🔄 Development

To modify the dashboard:

1. **API Changes**: Edit `server.js` and restart the server
2. **Frontend Changes**: Edit `index.html` and refresh the browser
3. **Integration Changes**: Edit `dashboard.tsx` in the documentation source

## 📈 Monitoring

The dashboard includes health monitoring:
- Automatic requirement scanning
- Error handling and logging
- Performance metrics
- Real-time status updates 