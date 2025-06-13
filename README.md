# Carity MCP Server

A Model Context Protocol (MCP) server that provides access to the Carity API for retrieving relevant chunks based on search queries.

## Overview

This MCP server implements a single tool called `retrieve_chunks` that interfaces with the Carity API. The tool allows you to search for and retrieve relevant content chunks based on your query from your knowledge models.

## Features

- **retrieve_chunks**: Retrieves relevant chunks from the Carity API based on a search query
- Comprehensive error handling with detailed error messages
- 10-second timeout protection for API calls
- Proper MCP protocol compliance
- API key authentication for secure access

## Installation

Install the package globally using npm:

```bash
npm install -g carity-mcp-server
```

Or install locally in your project:

```bash
npm install carity-mcp-server
```

## Environment Variables

Before using the server, you need to set up the following environment variables:

### Required Environment Variables

- `SERVER_API_KEY`: Your secure API key for MCP server authentication
- `API_KEY`: Your API key for Carity API authentication
- `CARITY_API_URL`: The base URL of your Carity API
### Setting Environment Variables

Create a `.env` file in your project directory:

```bash
# .env file
SERVER_API_KEY=your-mcp-server-api-key-here
API_KEY=your-carity-api-key-here
CARITY_API_URL=carity-api-url
```

Or export them in your shell:

```bash
export SERVER_API_KEY="your-mcp-server-api-key-here"
export API_KEY="your-carity-api-key-here"
export CARITY_API_URL="carity-api-url"
```

## Setup

1. **Install the package**:
   ```bash
   npm install -g carity-mcp-server
   ```

2. **Set up environment variables** as described above

3. **Run the MCP server**:
   ```bash
   carity-server
   ```

## Usage

### MCP Client Integration

Add the server to your MCP client configuration. The server communicates via stdio and can be integrated with any MCP-compatible client.

### Tool Parameters

**Tool Name**: `retrieve_chunks`

**Description**: Retrieve relevant chunks from Carity API based on a search query

**Parameters**:
- `query` (string, required): The search query to retrieve relevant chunks (minimum 1 character)
- `id` (number, required): The ID of the knowledge model to query (minimum value: 1)

### Example Usage

```json
{
  "name": "retrieve_chunks",
  "arguments": {
    "id": 1,
    "query": "What are the main features of the product?"
  }
}
```

### Sample Response

```json
{
  "chunks": [
    {
      "What are the main features of the product?": [
        {
          "id": 12345,
          "content": "The product features include advanced analytics, real-time processing, and seamless integration capabilities...",
          "knowledge_model_id": 1,
          "knowledge_question_id": 5001,
          "knowledge_answer_id": 3001,
          "neighbor_distance": 0.1234567890123456
        },
        {
          "id": 12346,
          "content": "Additional features encompass user-friendly interface, robust security measures, and scalable architecture...",
          "knowledge_model_id": 1,
          "knowledge_question_id": 5002,
          "knowledge_answer_id": 3002,
          "neighbor_distance": 0.2345678901234567
        }
      ]
    }
  ]
}
```

## API Integration Details

The server calls the Carity API with the following structure:
- **Base URL**: Configurable via `CARITY_API_URL` environment variable (default: `http://localhost:3001`)
- **Method**: POST
- **Endpoint**: `/retrieve_chunks`
- **Authentication**: Uses both `SERVER_API_KEY` for MCP authentication and `API_KEY` for Carity API calls
- **Payload**:
  ```json
  {
    "id": 1,
    "query": "Your search query here"
  }
  ```

## Error Handling

The server provides comprehensive error handling:
- **API Errors**: Returns detailed error messages from the Carity API
- **Network Errors**: Handles timeout and connection issues
- **Validation Errors**: Validates input parameters before making API calls
- **Authentication Errors**: Handles API key authentication failures
- **Status Codes**: Includes HTTP status codes in error responses

## Development

### Building from Source

If you want to build from source:

```bash
git clone <repository-url>
cd carity-mcp-server
npm install
npm run build
```

### Testing the Server

You can test the server by running it directly:

```bash
node build/index.js
```

The server will start and listen for MCP protocol messages via stdio.

### Available Scripts

- `npm run build`: Build the TypeScript source
- `npm run watch`: Watch for changes and rebuild
- `npm run start:mcp`: Start the MCP server
- `npm run test`: Run the test client

## Configuration

### MCP Client Configuration

Add this server to your MCP client configuration file:

```json
{
  "mcpServers": {
    "carity": {
      "command": "carity-server",
      "env": {
        "SERVER_API_KEY": "your-mcp-server-api-key-here",
        "API_KEY": "your-carity-api-key-here",
        "CARITY_API_URL": "http://localhost:3001"
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Authentication Error**: Ensure both `SERVER_API_KEY` and `API_KEY` are set correctly
2. **Connection Error**: Verify that your Carity API server is running and accessible
3. **Invalid Response**: Check that the API endpoint `/retrieve_chunks` is available
4. **Timeout Error**: Increase timeout if your API responses are slow

### Debug Mode

Set the environment variable `DEBUG=1` for verbose logging:

```bash
DEBUG=1 carity-server
```

## Dependencies

- `@modelcontextprotocol/sdk`: MCP SDK for server implementation
- `axios`: HTTP client for API requests
- `dotenv`: Environment variable management

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue in the repository or contact the maintainers.

## Version

Current version: 0.1.1
