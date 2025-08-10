# SchemaShield Report UI Enhancement

## Overview
The SchemaShield report frontend has been completely redesigned with a modern, responsive interface using React and TailwindCSS.

## Key Features

### 🎨 Modern Design
- **TailwindCSS Integration**: Clean, modern styling with utility-first CSS framework
- **Responsive Layout**: Works seamlessly on both desktop and mobile devices
- **Dashboard-style Interface**: Professional appearance with card-based layouts
- **Inter Font**: Modern typography for enhanced readability

### 📊 Enhanced Data Display
- **Method Badges**: Color-coded badges for different HTTP methods (GET, POST, PUT, DELETE, etc.)
- **Response Code Badges**: Color-coded response status indicators
- **Responsive Tables**: Desktop table view with mobile card layout fallback
- **Professional Typography**: Clear hierarchy and readable fonts

### 🔍 Search & Filter
- **Real-time Search**: Instant filtering by endpoint path or HTTP method
- **Case-insensitive**: Search works regardless of case
- **Search Hints**: Visual feedback and clear search state
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + F` to focus search
  - `Ctrl/Cmd + R` to refresh data

### ⚡ Performance Features
- **Loading States**: Visual feedback during data loading with spinner animation
- **Auto-refresh**: Automatic data refresh every 30 seconds
- **Smart Refresh**: Pauses auto-refresh when tab is not visible or user is searching
- **Error Handling**: Graceful error states with retry options
- **Memoized Components**: Optimized rendering for better performance

### 📱 Mobile Experience
- **Card Layout**: Mobile-optimized card view for smaller screens
- **Touch-friendly**: Optimized for touch interactions
- **Responsive Design**: Adapts to all screen sizes
- **Mobile-first Approach**: Designed with mobile users in mind

## Technical Improvements

### State Management
- **React Hooks**: Modern state management with useState, useEffect, useMemo, useCallback
- **Efficient Re-rendering**: Components only re-render when necessary
- **Persistent Search State**: Search terms persist until manually cleared

### UI Components
- **Modular Components**: Reusable components for consistent styling
- **SVG Icons**: Scalable icons with proper accessibility
- **Tailwind Utilities**: Consistent spacing, colors, and transitions
- **Loading Animations**: Smooth transitions and feedback

### API Integration
- **Proxy Support**: Uses `/api/` proxy endpoint for seamless integration
- **Enhanced Error Handling**: Detailed error messages and retry logic
- **Network Resilience**: Handles network failures gracefully
- **Auto-retry**: Automatic retry on failures

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers
- Responsive design for all screen sizes

## Usage

1. **View Endpoints**: See all captured API endpoints in a clean table/card layout
2. **Search**: Use the search bar to filter endpoints by path or method
3. **Refresh**: Click the refresh button or use Ctrl/Cmd+R to update data
4. **Monitor**: The page auto-refreshes every 30 seconds when active

## Accessing the Frontend

- **URL**: http://localhost:8090
- **API Proxy**: Calls to `/api/` are automatically proxied to the core API
- **Backend**: Data comes from the SchemaShield core API

## Color Coding

### HTTP Methods
- **GET**: Green badge (`bg-green-100 text-green-800`)
- **POST**: Blue badge (`bg-blue-100 text-blue-800`)
- **PUT**: Yellow badge (`bg-yellow-100 text-yellow-800`)
- **PATCH**: Orange badge (`bg-orange-100 text-orange-800`)
- **DELETE**: Red badge (`bg-red-100 text-red-800`)
- **OPTIONS**: Purple badge (`bg-purple-100 text-purple-800`)
- **HEAD**: Gray badge (`bg-gray-100 text-gray-800`)

### Response Status Codes
- **2xx**: Green (Success)
- **3xx**: Blue (Redirection)
- **4xx**: Yellow (Client Error)
- **5xx**: Red (Server Error)

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
cd services/report-ui
npm install
npm run dev
```

### Building
```bash
npm run build
```

### Docker
The application is containerized and can be built with:
```bash
docker compose -f deploy/compose.yml up --build report-ui
```

## Files Structure

```
services/report-ui/
├── src/
│   ├── main.jsx          # Main React application
│   └── index.css         # TailwindCSS styles and custom components
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # TailwindCSS configuration
├── postcss.config.js     # PostCSS configuration
├── vite.config.js        # Vite configuration with proxy
└── Dockerfile            # Multi-stage Docker build
```

## Configuration

### Environment Variables
- `VITE_API_BASE`: API base URL (defaults to using proxy)

### Vite Proxy
The development server proxies `/api` requests to `http://localhost:8080` for seamless development.

### Docker Configuration
The production build includes nginx configuration for:
- Static file serving
- SPA routing support
- API proxy to core-api service

## Performance Optimizations

1. **Code Splitting**: Vite automatically splits code for optimal loading
2. **Tree Shaking**: Unused code is eliminated from the bundle
3. **Asset Optimization**: Images and assets are optimized
4. **Gzip Compression**: nginx serves compressed assets
5. **Caching Headers**: Appropriate cache headers for static assets
6. **Lazy Loading**: Components are rendered only when needed
