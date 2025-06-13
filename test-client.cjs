const { spawn } = require("child_process");

// Get API key from environment variable
const apiKey = process.env.CARITY_API_KEY;

if (!apiKey) {
  console.error("Error: CARITY_API_KEY environment variable is required");
  process.exit(1);
}

// Spawn the server with the API key environment variable
const child = spawn("node", ["build/index.js"], {
  env: { ...process.env, CARITY_API_KEY: apiKey }
});

child.stdout.on("data", (data) => {
  console.log("STDOUT:", data.toString());
});

child.stderr.on("data", (data) => {
  console.error("STDERR:", data.toString());
});

child.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});

// Send initialization request first
const initRequest = {
  jsonrpc: "2.0",
  id: 0,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "test-client",
      version: "1.0.0"
    }
  }
};

// Send tool call request
const toolRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "retrieve_chunks",
    arguments: {
      query: 'What is the standard equipment on the ID.4 Base',
      id: 24
    }
  }
};

// Send requests with a small delay
setTimeout(() => {
  child.stdin.write(JSON.stringify(initRequest) + "\n");
  setTimeout(() => {
    child.stdin.write(JSON.stringify(toolRequest) + "\n");
  }, 100);
}, 100);
