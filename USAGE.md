# Carity MCP Server Usage Guide

## Environment Setup

The Carity MCP Server requires the following environment variables to be set before running:
- `SERVER_API_KEY`: Your server API key
- `API_KEY`: Your API key
- `CARITY_API_URL`: The base URL for the Carity API
- `NODE_ENV`: Environment mode (development, production, etc.)

### Setting the API Key

#### Option 1: Export in your shell
```bash
export SERVER_API_KEY="your-secure-api-key-here"
```

#### Option 2: Set in your shell profile
Add to your `~/.bashrc`, `~/.zshrc`, or equivalent:
```bash
export SERVER_API_KEY="your-secure-api-key-here"
```

#### Option 3: Use with npm commands
```bash
SERVER_API_KEY="your-secure-api-key-here" npm run start:mcp
```

## Running the Server

### Method 1: Using npm scripts
```bash
# Set the API key first
export SERVER_API_KEY="your-api-key"

# Start the server
npm run start:mcp
```

### Method 2: Direct execution
```bash
# Set the API key first
export SERVER_API_KEY="your-api-key"

# Run directly
node build/index.js
```

### Method 3: Using the published npm command (after publishing)
```bash
# Set the API key first
export SERVER_API_KEY="your-api-key"

# Run the published command
npm run start:mcp
```

## Testing the Server

### Using the test client
```bash
# Set the API key
export SERVER_API_KEY="test-api-key-123"

# Run the test
npm test
```

### Manual testing with curl (if you have a test endpoint)
```bash
# Example API call to your local Carity API
curl -X POST http://localhost:3001/retrieve_chunks \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: your-api-key" \
  -d '{"id": 23, "query": "What is Tuxmat?"}'
```

## Using the MCP Tool

Once the server is running with the API key, you can use the `retrieve_chunks` tool:

```json
{
  "name": "retrieve_chunks",
  "arguments": {
    "query": "What is Tuxmat made of?",
    "id": 23
  }
}
```

## Using with n8n

The Carity MCP Server supports n8n's comma-separated environment variable format. In n8n's MCP Client configuration:

### Configuration
- **Command**: `npx`
- **Arguments**: `--package=carity-mcp-server-v1@0.1.5 carity-mcp-server-v1`
- **Environment Variables**: Use comma-separated format like:
  ```
  SERVER_API_KEY=your_server_key,API_KEY=your_api_key,NODE_ENV=development,CARITY_API_URL=carity_api_url
  ```
The server will automatically detect and parse comma-separated environment variables when running in n8n.

## Troubleshooting

### Error: "CARITY_API_URL environment variable is required"
- Make sure you've set the `CARITY_API_URL` environment variable
- For n8n: Include `CARITY_API_URL=your_api_url` in the comma-separated environment variables
- Verify the URL is correct and accessible

### Error: "SERVER_API_KEY environment variable is required"
- Make sure you've set the `SERVER_API_KEY` environment variable
- For n8n: Include `SERVER_API_KEY=your_key` in the comma-separated environment variables
- Verify the variable is exported: `echo $SERVER_API_KEY`
- Restart your terminal/shell after setting the variable

### MCP Connection Issues
- Ensure all required environment variables are set: `SERVER_API_KEY`, `API_KEY`, `CARITY_API_URL`, `NODE_ENV`
- Check that the API keys are valid for your Carity API server
- Verify network connectivity to the API endpoint
- For n8n: Ensure the comma-separated environment variables are properly formatted
- Make sure the environment variables are properly passed to the MCP server process

### Connection Issues
- Ensure your Carity API server is accessible at the configured URL
- Check that the API key is valid for your Carity API server
- Verify network connectivity to the API endpoint
- Make sure the environment variable is properly passed to the MCP server process
