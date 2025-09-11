# smart-factory-mcp

This Project explores how to use MCP (Model Context Protocol) server to connect factory data stored in PostgreSQL with AI agents.
In order to achieve this use case, I have used sample dataset from Kaggle [https://www.kaggle.com/datasets/zara2099/industrial-energy-forecast-dataset?resource=download]

# Technologies

- PostgreSQL – data storage
- TypeScript – backend implementation
- MCP – tool interface for AI agents
- Ollama – local LLM serving
- Docker Compose – orchestration

# Setup

- Start services with docker compose

```
docker compose up -d
```

- Pull the llm model for llama

```shell
docker exec -it ollama ollama pull llama3.1
```

### Reference

https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/examples/server/simpleStatelessStreamableHttp.ts
