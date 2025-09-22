# smart-factory-mcp

This project explores how to use the **Model Context Protocol (MCP)** server to connect factory data stored in PostgreSQL with AI agents.  
To demonstrate the use case, I have used sample dataset from Kaggle: [Industrial Energy Forecast Dataset](https://www.kaggle.com/datasets/zara2099/industrial-energy-forecast-dataset?resource=download).

👉 check out the detailed article on Dev.to for more details: [Connecting AI Agents to Factory Data with MCP, Node.js & TypeScript](https://dev.to/gins_cyriac/connecting-ai-agents-to-factory-data-with-mcp-nodejs-typescript-44e)

## 🚀 Technologies

- **PostgreSQL** – Data storage
- **TypeScript** – Backend implementation
- **MCP (Model Context Protocol)** – Tool interface for AI agents
- **Ollama** – Local LLM serving
- **Docker Compose** – Service orchestration

## ⚙️ Setup

- Start services:

```bash
docker compose up -d
```

- Pull the llm model for llama

```shell
docker exec -it ollama ollama pull llama3.1
```

### Reference

[MCP TypeScript SDK Example](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/examples/server/simpleStatelessStreamableHttp.ts)
