#!/usr/bin/env node

/**
 * Carity MCP Server
 * Provides a retrieve_chunks tool that queries the Carity API
 * for retrieving relevant chunks based on search queries.
 */

import dotenv from "dotenv";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

/**
 * Interface for the arguments expected by the retrieve_chunks tool
 */
interface RetrieveChunksArgs {
  query: string;
  id: number;
}

/**
 * Interface for the arguments expected by the get_single_order_details tool
 */
interface GetSingleOrderDetailsArgs {
  order_number: string;
}

/**
 * Interface for the arguments expected by the get_single_product_inventory_details tool
 */
interface GetSingleProductInventoryDetailsArgs {
  sku_id: number;
}

/**
 * Interface for the arguments expected by the ymmt_cjson tool
 */
interface YmmtCjsonArgs {
  year: number;
  make: string;
  model: string;
  trim_variant?: string | null;
}

/**
 * Type guard to validate retrieve_chunks arguments
 */
const isValidRetrieveChunksArgs = (args: any): args is RetrieveChunksArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.query === 'string' &&
  args.query.trim().length > 0 &&
  typeof args.id === 'number' &&
  args.id > 0;

/**
 * Type guard to validate get_single_order_details arguments
 */
const isValidGetSingleOrderDetailsArgs = (args: any): args is GetSingleOrderDetailsArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.order_number === 'string' &&
  args.order_number.trim().length > 0;

/**
 * Type guard to validate get_single_product_inventory_details arguments
 */
const isValidGetSingleProductInventoryDetailsArgs = (args: any): args is GetSingleProductInventoryDetailsArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.sku_id === 'number' &&
  args.sku_id > 0 &&
  Number.isInteger(args.sku_id);

/**
 * Type guard to validate ymmt_cjson arguments
 */
const isValidYmmtCjsonArgs = (args: any): args is YmmtCjsonArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.year === 'number' &&
  args.year > 0 &&
  Number.isInteger(args.year) &&
  typeof args.make === 'string' &&
  args.make.trim().length > 0 &&
  typeof args.model === 'string' &&
  args.model.trim().length > 0 &&
  (args.trim_variant === undefined || args.trim_variant === null || typeof args.trim_variant === 'string');

/**
 * Carity MCP Server class
 */
class CarityServer {
  private server: Server;
  private axiosInstance;
  private apiKey: string;

  constructor() {
    // Set the API key from environment variable
    const apiKey = process.env.SERVER_API_KEY;

    if (!apiKey) {
      console.error("Error: SERVER_API_KEY environment variable is required");
      process.exit(1);
    }

    this.apiKey = apiKey;

    this.server = new Server(
      {
        name: "carity-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Configure axios instance for Carity API
    const baseURL = this.getBaseURL();
    this.axiosInstance = axios.create({
      baseURL: baseURL,
      timeout: 30000, // 30 second timeout
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_KEY
      }
    });

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  /**
   * Get the base URL from environment variables
   */
  private getBaseURL(): string {
    // Use CARITY_API_URL from the environment variable
    const baseURL = process.env.CARITY_API_URL;

    if (!baseURL) {
      console.error("Error: CARITY_API_URL environment variable is required");
      process.exit(1);
    }

    return baseURL;
  }

  /**
   * Set up error handling for the server
   */
  private setupErrorHandling() {
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Set up tool handlers for the MCP server
   */
  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async (request) => {
      return {
        tools: [
          {
            name: "retrieve_chunks",
            description: "Retrieve relevant chunks from Carity API based on a search query",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query to retrieve relevant chunks",
                  minLength: 1,
                },
                id: {
                  type: "number",
                  description: "The ID of the knowledge model to query",
                  minimum: 1,
                },
              },
              required: ["query", "id"],
            },
          },
          {
            name: "get_single_order_details",
            description: "Retrieve detailed information for a single retail order",
            inputSchema: {
              type: "object",
              properties: {
                order_number: {
                  type: "string",
                  description: "Alphanumeric order number (can contain special characters)",
                  minLength: 1,
                },
              },
              required: ["order_number"],
            },
          },
          {
            name: "get_single_product_inventory_details",
            description: "Retrieve inventory details for a single product",
            inputSchema: {
              type: "object",
              properties: {
                sku_id: {
                  type: "number",
                  description: "Numeric SKU identifier for the product",
                  pattern: "^[0-9]+$",
                  minLength: 1,
                },
              },
              required: ["sku_id"],
            },
          },
          {
            name: "ymmt_cjson",
            description: "This tool is used to retrieve information about a specific vehicle, such as standard equipment, options, specifications and other information specific to a vehicle",
            inputSchema: {
              type: "object",
              properties: {
                year: {
                  type: "number",
                  description: "The year the vehicle was manufactured",
                },
                make: {
                  type: "string",
                  description: "The manufacturer of the vehicle",
                },
                model: {
                  type: "string",
                  description: "The model of the vehicle",
                },
                trim_variant: {
                  type: ["string", "null"],
                  description: "The trim variant of the vehicle (optional)",
                },
              },
              required: ["year", "make", "model", "trim_variant"],
              additionalProperties: false,
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === "retrieve_chunks") {
        return await this.handleRetrieveChunks(args);
      }

      if (name === "get_single_order_details") {
        return await this.handleGetSingleOrderDetails(args);
      }

      if (name === "get_single_product_inventory_details") {
        return await this.handleGetSingleProductInventoryDetails(args);
      }

      if (name === "ymmt_cjson") {
        return await this.handleYmmtCjson(args);
      }

      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${name}`
      );
    });
  }

  /**
   * Handle the retrieve_chunks tool call
   */
  private async handleRetrieveChunks(args: any) {
    // Validate arguments
    if (!isValidRetrieveChunksArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid arguments: query must be a non-empty string and id must be a positive number"
      );
    }

    const { query, id } = args;

    try {
      // Call the Carity API with the specified parameters
      const response = await this.axiosInstance.post('/mcp/v1/knowledge_models/retrieve_chunks', {
        id: id,
        query: query
      });

      // Return successful response
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error) {
      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message ||
                           error.response?.data?.error ||
                           error.message ||
                           "Unknown API error occurred";
        const statusCode = error.response?.status || "N/A";

        return {
          content: [
            {
              type: "text",
              text: `Error retrieving chunks from Carity API: ${errorMessage} (Status: ${statusCode})`,
            },
          ],
          isError: true,
        };
      }

      // Handle non-axios errors
      return {
        content: [
          {
            type: "text",
            text: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Handle the get_single_order_details tool call
   */
  private async handleGetSingleOrderDetails(args: any) {
    // Validate arguments
    if (!isValidGetSingleOrderDetailsArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid arguments: order_number must be a non-empty string"
      );
    }

    const { order_number } = args;

    try {
      // Call the Carity API with the specified parameters
      const response = await this.axiosInstance.post('/mcp/v1/open_ai_tools/single_order_details', {
        params: {
          order_number: order_number
        }
      });

      // Return successful response
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error) {
      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message ||
                           error.response?.data?.error ||
                           error.message ||
                           "Unknown API error occurred";
        const statusCode = error.response?.status || "N/A";

        return {
          content: [
            {
              type: "text",
              text: `Error retrieving order details from Carity API: ${errorMessage} (Status: ${statusCode})`,
            },
          ],
          isError: true,
        };
      }

      // Handle non-axios errors
      return {
        content: [
          {
            type: "text",
            text: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Handle the get_single_product_inventory_details tool call
   */
  private async handleGetSingleProductInventoryDetails(args: any) {
    // Validate arguments
    if (!isValidGetSingleProductInventoryDetailsArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid arguments: sku_id must be a positive integer"
      );
    }

    const { sku_id } = args;

    try {
      // Call the Carity API with the specified parameters
      const response = await this.axiosInstance.post('/mcp/v1/open_ai_tools/single_product_inventory_details', {
        params: {
          sku_id: sku_id
        }
      });

      // Return successful response
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error) {
      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message ||
                           error.response?.data?.error ||
                           error.message ||
                           "Unknown API error occurred";
        const statusCode = error.response?.status || "N/A";

        return {
          content: [
            {
              type: "text",
              text: `Error retrieving inventory details from Carity API: ${errorMessage} (Status: ${statusCode})`,
            },
          ],
          isError: true,
        };
      }

      // Handle non-axios errors
      return {
        content: [
          {
            type: "text",
            text: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Handle the ymmt_cjson tool call
   */
  private async handleYmmtCjson(args: any) {
    // Validate arguments
    if (!isValidYmmtCjsonArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid arguments: year must be a positive integer, make and model must be non-empty strings, and trim_variant must be a string or null"
      );
    }

    const { year, make, model, trim_variant } = args;

    try {
      // Call the Carity API with the specified parameters
      const response = await this.axiosInstance.post('/mcp/v1/ymmt_cjsons/ymmt_cjson', {
        year: year,
        make: make,
        model: model,
        trim_variant: trim_variant
      });

      // Return successful response
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error) {
      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message ||
                           error.response?.data?.error ||
                           error.message ||
                           "Unknown API error occurred";
        const statusCode = error.response?.status || "N/A";

        return {
          content: [
            {
              type: "text",
              text: `Error retrieving vehicle information from Carity API: ${errorMessage} (Status: ${statusCode})`,
            },
          ],
          isError: true,
        };
      }

      // Handle non-axios errors
      return {
        content: [
          {
            type: "text",
            text: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Start the server
   */
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Carity MCP server running on stdio");
  }
}

/**
 * Parse comma-separated environment variables (for n8n compatibility)
 */
function parseCommaSeparatedEnvVars() {
  // Check if we have comma-separated environment variables in any of the common env vars
  const envVarsToCheck = ['SERVER_API_KEY', 'API_KEY', 'NODE_ENV', 'CARITY_API_URL', 'CARITY_BASE_URL'];

  for (const envVar of envVarsToCheck) {
    const value = process.env[envVar];
    if (value && value.includes(',')) {
      // This looks like comma-separated env vars, parse them all
      const pairs = value.split(',');
      for (const pair of pairs) {
        const [key, val] = pair.split('=');
        if (key && val) {
          process.env[key.trim()] = val.trim();
        }
      }
      break; // We found and parsed comma-separated vars, no need to continue
    }
  }
}

/**
 * Load environment configuration based on NODE_ENV
 */
function loadEnvironmentConfig() {
  // First, try to parse comma-separated environment variables (for n8n)
  parseCommaSeparatedEnvVars();

  const env = process.env.NODE_ENV || 'local';

  // Load environment-specific file first
  try {
    dotenv.config({ path: `.env.${env}` });
  } catch (error) {
    console.warn(`Warning: Could not load .env.${env} file`);
  }

  // Load default .env file as fallback
  try {
    dotenv.config({ path: '.env' });
  } catch (error) {
    console.warn('Warning: Could not load .env file');
  }
}

/**
 * Main function to start the server
 */
async function main() {
  // Load environment configuration
  loadEnvironmentConfig();

  const server = new CarityServer();
  await server.run();
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
