# API Key Authentication Setup for Carity MCP Server

This guide explains how to configure API key authentication for the Carity MCP Server to protect access to the server.

## Overview

The MCP server now requires an API key for all requests. This adds a security layer to prevent unauthorized access to your server and the underlying Carity API.

## Configuration Methods

### Method 1: Environment Variable (Recommended)

Set the `MCP_SERVER_API_KEY` environment variable:

```bash
export MCP_SERVER_API_KEY="your-secure-api-key-here"
```

### Method 2: Default Key

If no environment variable is set, the server uses the default key: `"your-secure-api-key-here"`

**⚠️ Important**: Change this default key in production!

## Setting Up the API Key

### 1. Generate a Secure API Key

Generate a strong API key using one of these methods:

```bash
# Method 1: Using openssl
openssl rand -hex 32

# Method 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 3: Using uuidgen
uuidgen
```

### 2. Set the Environment Variable

#### For Linux/macOS:
```bash
# Temporary (current session only)
export MCP_SERVER_API_KEY="your-generated-api-key"

# Permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export MCP_SERVER_API_KEY="your-generated-api-key"' >> ~/.bashrc
source ~/.bashrc
```

#### For Windows:
```cmd
# Temporary
set MCP_SERVER_API_KEY=your-generated-api-key

# Permanent
setx MCP_SERVER_API_KEY "your-generated-api-key"
```

### 3. Update MCP Client Configuration

The MCP client needs to send the API key with requests. However, the current MCP protocol and Cline implementation may not support custom headers or metadata for authentication.

**Note**: The current implementation expects the API key in the request metadata, but this may need to be adapted based on how your MCP client can send authentication information.

## Alternative Implementation: Command Line Argument

If environment variables don't work for your setup, you can modify the server to accept the API key as a command line argument:

```typescript
// In the constructor, add:
const apiKeyArg = process.argv.find(arg => arg.startsWith('--api-key='));
this.requiredApiKey = apiKeyArg ?
  apiKeyArg.split('=')[1] :
  process.env.MCP_SERVER_API_KEY || "your-secure-api-key-here";
```

Then run the server with:
```bash
node build/index.js --api-key=your-secure-api-key
```

## Testing the Authentication

### 1. Test Without API Key
The server should reject requests without a valid API key.

### 2. Test With Valid API Key
Requests with the correct API key should work normally.

### 3. Test With Invalid API Key
The server should reject requests with an incorrect API key.

## Security Best Practices

1. **Use Strong Keys**: Generate cryptographically secure random keys
2. **Keep Keys Secret**: Never commit API keys to version control
3. **Rotate Keys**: Regularly change your API keys
4. **Use Environment Variables**: Avoid hardcoding keys in source code
5. **Secure Storage**: Store keys securely in production environments

## Troubleshooting

### Common Issues:

1. **"Invalid or missing API key" Error**
   - Ensure the API key is correctly set in the environment variable
   - Verify the MCP client is sending the API key in the request metadata

2. **Environment Variable Not Found**
   - Check if the variable is set: `echo $MCP_SERVER_API_KEY`
   - Restart your terminal/IDE after setting the variable

3. **MCP Client Configuration**
   - The current MCP protocol may not support custom authentication
   - You may need to modify the client or use a different authentication method

## Current Limitations

The current implementation assumes the MCP client can send API keys in request metadata. However, the standard MCP protocol and current Cline implementation may not support this directly.

### Possible Solutions:

1. **Modify the MCP Client**: Update Cline or your MCP client to support API key headers
2. **Use Process-Level Authentication**: Rely on process isolation and system-level security
3. **Implement Token-Based Auth**: Create a more sophisticated authentication system
4. **Use Network-Level Security**: Implement authentication at the network/proxy level

## Example Usage

Once properly configured, the server will validate API keys on all requests:

```javascript
// This request would be rejected without proper API key
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "meta": {
    "apiKey": "your-secure-api-key-here"
  }
}
```

## Next Steps

1. Generate a secure API key
2. Set the environment variable
3. Test the server with your MCP client
4. Monitor logs for authentication attempts
5. Consider implementing additional security measures as needed
