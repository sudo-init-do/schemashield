# SchemaShield Codebase Documentation

## Overview

This document provides a comprehensive guide to the SchemaShield codebase architecture, design patterns, and implementation details.

## Architecture

### System Design

SchemaShield follows a microservices architecture with the following components:

1. **Core API Service** - Central data management and schema inference
2. **Proxy Service** - Traffic interception and forwarding
3. **Report UI Service** - Web-based user interface
4. **Sample API Service** - Example API for testing

### Technology Stack

#### Backend Services
- **Python 3.12**: Core API and Proxy services
- **FastAPI**: REST API framework with automatic OpenAPI generation
- **SQLModel**: Type-safe database ORM with Pydantic integration
- **SQLite**: Lightweight database for data persistence
- **aiohttp**: Asynchronous HTTP client/server framework
- **uvicorn**: ASGI server implementation

#### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe JavaScript development
- **TailwindCSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server

#### Infrastructure
- **Docker**: Containerization platform
- **Docker Compose**: Multi-container orchestration
- **nginx**: Web server and reverse proxy

## Service Details

### Core API Service

**Location**: `services/core-api/`

**Responsibilities**:
- HTTP traffic data storage
- OpenAPI schema inference
- RESTful API endpoints
- Mock response generation

**Key Files**:
- `app/main.py`: FastAPI application with endpoints
- `pyproject.toml`: Python dependencies
- `Dockerfile`: Container configuration

**Database Schema**:
```python
class Capture(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    method: str                    # HTTP method
    path: str                      # Request path
    status: int                    # Response status code
    req_headers: str               # JSON string of request headers
    req_body: Optional[str]        # Request body content
    res_headers: str               # JSON string of response headers
    res_body: Optional[str]        # Response body content
    latency_ms: int                # Request latency in milliseconds
    created_at: float              # Timestamp of capture
```

**API Endpoints**:
- `GET /health`: Service health check
- `POST /capture`: Store captured HTTP traffic
- `GET /report`: Retrieve OpenAPI schema and summary
- `GET /mock/{path}`: Return mock responses

### Proxy Service

**Location**: `services/proxy/`

**Responsibilities**:
- HTTP traffic interception
- Request forwarding to target API
- Response capture and forwarding to Core API
- Transparent proxy operation

**Key Files**:
- `app/main.py`: aiohttp-based proxy server
- `Dockerfile`: Container configuration

**Implementation Details**:
```python
async def forward(request: web.Request):
    # Extract request details
    tail = request.match_info.get("tail", "")
    target_url = f"{TARGET_BASE}/{tail}"
    method = request.method
    req_headers = dict(request.headers)
    req_body = await request.read()
    
    # Forward request and measure latency
    t0 = time.perf_counter()
    # ... forward request ...
    latency_ms = int((time.perf_counter() - t0) * 1000)
    
    # Capture data (fire-and-forget)
    # ... send to core API ...
    
    # Return response to client
    return web.Response(status=res_status, headers=res_headers, body=res_body)
```

### Report UI Service

**Location**: `services/report-ui/`

**Responsibilities**:
- Modern web interface for viewing captured data
- Real-time endpoint discovery dashboard
- Search and filtering capabilities
- Responsive design for mobile and desktop

**Key Files**:
- `src/main.jsx`: Main React application
- `src/index.css`: TailwindCSS styles and custom components
- `index.html`: HTML template
- `vite.config.js`: Vite configuration with API proxy
- `tailwind.config.js`: TailwindCSS configuration
- `Dockerfile`: Multi-stage container build

**Component Architecture**:
```
App
├── StatsCard (endpoint count display)
├── SearchInput (filtering interface)
├── RefreshButton (data refresh control)
├── Desktop Table View
│   └── EndpointRow (table row component)
├── Mobile Card View
│   └── EndpointCard (card component)
├── EmptyState (no data display)
├── LoadingState (loading indicator)
└── ErrorState (error handling)
```

**State Management**:
- React hooks for local state
- `useMemo` for computed values (filtered endpoints)
- `useCallback` for event handlers
- `useEffect` for side effects (API calls, auto-refresh)

**Key Features Implementation**:

**Auto-refresh with Page Visibility**:
```javascript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopAutoRefresh();
    } else {
      startAutoRefresh();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

**Keyboard Shortcuts**:
```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      fetchReport();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      document.getElementById('search-input')?.focus();
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Sample API Service

**Location**: `services/sample-api/`

**Responsibilities**:
- Provide example API endpoints for testing
- Demonstrate various HTTP methods and response codes
- Simple pet store API implementation

**Endpoints**:
- `GET /pets`: List all pets
- `GET /pets/{pet_id}`: Get specific pet by ID

## Design Patterns

### Backend Patterns

**Dependency Injection**:
- FastAPI's built-in dependency injection for database sessions
- Configuration management through environment variables

**Repository Pattern**:
- SQLModel abstracts database operations
- Clean separation between data access and business logic

**Middleware Pattern**:
- CORS middleware for cross-origin requests
- Error handling middleware for consistent responses

### Frontend Patterns

**Component Composition**:
- Small, focused components with single responsibilities
- Higher-order components for shared functionality

**Custom Hooks**:
- Reusable state logic for data fetching
- Encapsulated side effects management

**Conditional Rendering**:
- Dynamic UI based on application state
- Responsive design patterns for different screen sizes

## Build and Deployment

### Development Workflow

1. **Local Development**:
   - Use `npm run dev` for frontend development with hot reload
   - Use `uvicorn --reload` for backend development with auto-restart
   - Docker Compose for full system integration testing

2. **Code Quality**:
   - ESLint and Prettier for JavaScript/TypeScript
   - Type checking with TypeScript compiler
   - Python linting with built-in tools

3. **Testing Strategy**:
   - Unit tests for individual components
   - Integration tests for API endpoints
   - End-to-end testing with full system

### Production Build

**Frontend Build Process**:
```dockerfile
# Multi-stage build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

**Backend Containerization**:
- Lightweight Alpine Linux base images
- Multi-stage builds for smaller production images
- Security best practices with non-root users

### Configuration Management

**Environment Variables**:
- Development: `.env` files for local configuration
- Production: Docker Compose environment variables
- Secrets: External secret management systems

**Service Discovery**:
- Docker Compose networking for service communication
- Health checks for service availability
- Graceful degradation for service failures

## Database Design

### Schema Evolution

**Migration Strategy**:
- SQLModel provides automatic table creation
- Schema changes require manual migration scripts
- Backward compatibility considerations

**Data Models**:
```python
# Core data capture model
class Capture(SQLModel, table=True):
    # Primary key
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Request metadata
    method: str = Field(index=True)
    path: str = Field(index=True)
    
    # Response metadata
    status: int = Field(index=True)
    
    # Content (stored as text)
    req_headers: str
    req_body: Optional[str] = None
    res_headers: str
    res_body: Optional[str] = None
    
    # Performance metrics
    latency_ms: int
    created_at: float = Field(default_factory=time.time, index=True)
```

### Performance Considerations

**Indexing Strategy**:
- Primary key index on `id`
- Composite indexes on frequently queried fields
- Balance between query performance and write performance

**Data Retention**:
- Consider implementing data archival
- Monitor database size growth
- Implement cleanup for old captures

## Security Considerations

### Input Validation

**Backend Validation**:
- Pydantic models for request validation
- SQL injection prevention through ORM
- Content-type validation for requests

**Frontend Validation**:
- Input sanitization for user-provided data
- XSS prevention through React's built-in escaping
- CSRF protection considerations

### Network Security

**CORS Configuration**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Proxy Security**:
- Header filtering for sensitive information
- Request size limits
- Rate limiting considerations

## Performance Optimization

### Frontend Optimization

**Bundle Optimization**:
- Vite's automatic code splitting
- Tree shaking for unused code elimination
- Asset optimization for production builds

**Runtime Performance**:
- React.memo for component memoization
- useMemo and useCallback for expensive computations
- Virtual scrolling for large datasets (future enhancement)

### Backend Optimization

**Database Performance**:
- Connection pooling for database connections
- Query optimization with proper indexing
- Pagination for large result sets

**API Performance**:
- Async/await for non-blocking operations
- Connection reuse for HTTP clients
- Caching strategies for frequent queries

## Monitoring and Observability

### Logging Strategy

**Structured Logging**:
- JSON format for log aggregation
- Correlation IDs for request tracing
- Different log levels for different environments

**Application Metrics**:
- Request/response times
- Error rates and types
- Database query performance
- Memory and CPU usage

### Health Checks

**Service Health**:
- HTTP health check endpoints
- Database connectivity checks
- Dependency availability monitoring

## Future Enhancements

### Technical Debt

**Code Quality Improvements**:
- Comprehensive test coverage
- Performance profiling and optimization
- Security audit and hardening

**Feature Enhancements**:
- Real-time WebSocket updates
- Advanced filtering and search
- Export functionality for captured data
- API versioning support

### Scalability Considerations

**Horizontal Scaling**:
- Stateless service design
- Database clustering and replication
- Load balancing strategies

**Data Management**:
- Data partitioning strategies
- Archive and backup procedures
- Performance monitoring and alerting
