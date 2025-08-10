# SchemaShield

SchemaShield is an API schema inference and monitoring tool that automatically captures HTTP traffic, infers OpenAPI specifications, and provides a modern web interface for viewing discovered endpoints.

## Overview

SchemaShield consists of several microservices that work together to capture, analyze, and present API traffic data:

- **Core API**: Central service for data storage and schema inference
- **Proxy Service**: Traffic capture and forwarding
- **Report UI**: Modern React-based web interface
- **Sample API**: Example API for testing and demonstration

## Features

### Traffic Capture
- Transparent HTTP traffic proxying
- Real-time request/response capture
- Automatic schema inference from captured data
- SQLite-based data persistence

### Web Interface
- Modern responsive design with TailwindCSS
- Real-time endpoint discovery dashboard
- Advanced search and filtering capabilities
- Color-coded HTTP method and status indicators
- Keyboard shortcuts for enhanced productivity
- Auto-refresh functionality with smart pausing

### API Schema Generation
- Automatic OpenAPI 3.0 specification generation
- Response schema inference from captured traffic
- YAML export functionality
- RESTful API for programmatic access

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Python 3.12+ (for development)

### Running with Docker Compose

1. Clone the repository:
```bash
git clone <repository-url>
cd schemashield
```

2. Start all services:
```bash
make up
```

3. Access the services:
- Report UI: http://localhost:8090
- Core API: http://localhost:8080
- Proxy: http://localhost:8081
- Sample API: http://localhost:8082

### Development Setup

#### Report UI Development
```bash
cd services/report-ui
npm install
npm run dev
```
Access at http://localhost:5173

#### Core API Development
```bash
cd services/core-api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

## Architecture

### Service Communication
```
Client Request → Proxy Service → Sample API
                      ↓
              Core API (captures data)
                      ↓
              Report UI (displays data)
```

### Data Flow
1. HTTP requests are sent to the Proxy Service
2. Proxy forwards requests to the target API
3. Request/response data is captured and sent to Core API
4. Core API stores data and generates OpenAPI schemas
5. Report UI fetches and displays the captured data

## API Documentation

### Core API Endpoints

#### POST /capture
Capture HTTP traffic data.

**Request Body:**
```json
{
  "method": "GET",
  "path": "/pets",
  "status": 200,
  "req_headers": {},
  "req_body": null,
  "res_headers": {},
  "res_body": "{\"pets\": []}",
  "latency_ms": 150
}
```

#### GET /report
Retrieve captured endpoints and OpenAPI schema.

**Response:**
```json
{
  "summary": {
    "endpoints": 5
  },
  "openapi": {
    "openapi": "3.0.3",
    "info": {
      "title": "Inferred API",
      "version": "0.0.1"
    },
    "paths": {}
  }
}
```

#### GET /mock/{path}
Retrieve mock responses based on captured data.

### Configuration

#### Environment Variables

**Core API:**
- `DB_PATH`: SQLite database path (default: `/app/data/schemashield.sqlite`)
- `CORE_API_HOST`: Host binding (default: `0.0.0.0`)
- `CORE_API_PORT`: Port binding (default: `8080`)

**Proxy Service:**
- `PROXY_HOST`: Host binding (default: `0.0.0.0`)
- `PROXY_PORT`: Port binding (default: `8081`)
- `PROXY_TARGET_BASE`: Target API base URL (default: `http://sample-api:8082`)

## Development

### Project Structure
```
schemashield/
├── deploy/
│   ├── compose.yml          # Docker Compose configuration
│   └── .env                 # Environment variables
├── services/
│   ├── core-api/           # Core API service
│   ├── proxy/              # Proxy service
│   ├── report-ui/          # React web interface
│   └── sample-api/         # Example API
├── data/                   # Generated data files
└── Makefile               # Common commands
```

### Common Commands

```bash
# Start all services
make up

# Stop all services
make down

# View logs
make logs

# Check service status
make ps
```

### Testing

#### Manual Testing
1. Start the services with `make up`
2. Send requests through the proxy:
```bash
curl http://localhost:8081/proxy/pets
```
3. View captured data at http://localhost:8090

#### API Testing
```bash
# Test core API health
curl http://localhost:8080/health

# Test report endpoint
curl http://localhost:8080/report
```

## Deployment

### Production Deployment

1. Update environment variables in `deploy/.env`
2. Build and deploy:
```bash
docker-compose -f deploy/compose.yml up -d --build
```

### Security Considerations

- Configure CORS origins for production
- Use HTTPS in production environments
- Secure database access
- Implement authentication for sensitive endpoints
- Validate and sanitize all input data

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- Python: Follow PEP 8 guidelines
- JavaScript/TypeScript: Use Prettier and ESLint
- React: Follow React best practices
- CSS: Use TailwindCSS utility classes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions, issues, or contributions, please open an issue on the project repository.
