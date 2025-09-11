import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./modules/tools.js";
import { registerPrompts } from "./modules/prompt.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import { seedDatabase } from "./db/seed.js";

async function main() {
  await seedDatabase();

  const app = express();
  app.use(express.json());

  app.use(
    cors({
      origin: "*",
      exposedHeaders: ["Mcp-Session-Id"],
    })
  );

  const getServer = () => {
    const server = new McpServer(
      {
        name: "stateless-streamable-http-server",
        version: "1.0.0",
      },
      { capabilities: { logging: {} } }
    );

    registerTools(server);
    registerPrompts(server);
    return server;
  };

  app.post("/mcp", async (req: Request, res: Response) => {
    const server = getServer();
    try {
      const transport: StreamableHTTPServerTransport =
        new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        console.log("Request closed");
        transport.close();
        server.close();
      });
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", async (req: Request, res: Response) => {
    console.log("Received GET MCP request");
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      })
    );
  });

  app.delete("/mcp", async (req: Request, res: Response) => {
    console.log("Received DELETE MCP request");
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      })
    );
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, (error) => {
    if (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
    console.log(
      `MCP Stateless Streamable HTTP Server listening on port ${PORT}`
    );
  });

  process.on("SIGINT", async () => {
    console.log("Shutting down server...");
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Failed to start MCP server:", err.message);
  process.exit(1);
});
