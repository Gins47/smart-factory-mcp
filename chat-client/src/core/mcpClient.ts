import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export class MCPClient {
  private client: Client | null = null;
  private transport: StreamableHTTPClientTransport | null = null;

  constructor(
    private readonly serviceUrl: string = process.env.MCP_SERVER_URL ||
      "http://mcp-server:4000/mcp",
    private readonly name: string = "api-client",
    private readonly version: string = "1.0.0"
  ) {}

  async connect() {
    if (this.client) {
      return this.client;
    }
    const baseUrl = new URL(this.serviceUrl);
    this.transport = new StreamableHTTPClientTransport(new URL(baseUrl));
    this.client = new Client({ name: this.name, version: this.version });
    await this.client.connect(this.transport);
    console.log(
      `Connected to MCP Server using Streamable HTTP transport ${this.serviceUrl}`
    );
    return this.client;
  }

  async disconnect() {
    if (this.transport) {
      this.transport.close();
      this.transport = null;
    }
    if (this.client) {
      this.client.close();
      this.client = null;
    }
    console.log(`Disconnect from MCP Server ${this.serviceUrl}`);
  }

  async callTool(toolName: string, args: any) {
    const client = await this.connect();
    return client.callTool({ name: toolName, arguments: args });
  }

  async listTools() {
    const client = await this.connect();
    return client.listTools();
  }
}
