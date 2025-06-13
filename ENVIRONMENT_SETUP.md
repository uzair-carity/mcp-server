# Environment Configuration Guide

This MCP server supports multiple environments through environment-specific configuration files. The server automatically loads the appropriate configuration based on the `NODE_ENV` environment variable.

## Environment Files

The following environment files are available:

- `.env` - Default configuration (used as fallback)
- `.env.local` - Local development environment
- `.env.development` - Development/Staging environment
- `.env.production` - Production environment

## Environment Variables

Each environment file contains the following variables:

### Required Variables
- `SERVER_API_KEY` - Your server API key
- `API_KEY` - Your API key for the Carity API
- `NODE_ENV` - The environment name (local, development, production)
- `CARITY_BASE_URL` - The base URL for the Carity API

### Environment-Specific URLs
- **Local**: `http://localhost:3001`
- **Development/Staging**: `https://api.platform-dev.carity.ai`
- **Production**: `https://api.platform.carity.ai`

## Usage

### Method 1: Set NODE_ENV before running
```bash
# For local development
NODE_ENV=local node build/index.js

# For development/staging
NODE_ENV=development node build/index.js

# For production
NODE_ENV=production node build/index.js
```

### Method 2: Export NODE_ENV in your shell
```bash
# Set environment
export NODE_ENV=production

# Run the server
node build/index.js
```

### Method 3: Use with process managers
```bash
# With PM2
pm2 start build/index.js --name "carity-mcp" --env production

# With systemd (set Environment in service file)
Environment=NODE_ENV=production
```

## Configuration Priority

The server loads environment variables in the following order:
1. Environment-specific file (`.env.${NODE_ENV}`)
2. Default file (`.env`) as fallback
3. System environment variables (highest priority)

## Setup Instructions

1. Copy the appropriate environment file and update the API keys:
   ```bash
   # For local development
   cp .env.local .env.local.example
   # Edit .env.local with your actual API keys

   # For production
   cp .env.production .env.production.example
   # Edit .env.production with your actual API keys
   ```

2. Set the NODE_ENV and run:
   ```bash
   NODE_ENV=local npm start
   ```

## Security Notes

- Never commit actual API keys to version control
- Use different API keys for different environments
- Ensure production environment files have restricted permissions
- Consider using a secrets management system for production deployments
