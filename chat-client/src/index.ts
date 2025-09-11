import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import axios from "axios";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MCP_SERVER_URL =
  process.env.MCP_SERVER_URL || "http://localhost:4000/mcp";
const LLM_MODEL = process.env.MCP_MODEL || "llama3.1";

// -------------------- MCP CLIENT --------------------
let mcpClient: Client | null = null;

async function getMcpClient() {
  if (mcpClient) return mcpClient;
  const baseUrl = new URL(MCP_SERVER_URL);

  const transport = new StreamableHTTPClientTransport(new URL(baseUrl));

  const client = new Client({ name: "chat-client", version: "1.0.0" });

  await client.connect(transport);
  console.log("Connected using Streamable HTTP transport");
  return client;
}

// -------------------- TOOLS --------------------
async function getTools() {
  try {
    const client = await getMcpClient();
    const tools = await client.listTools();
    return tools;
  } catch (error) {
    console.error("❌ Error occurred when fetching tools:", error);
    throw error;
  }
}

async function callTool(toolName: string, args: any) {
  try {
    const client = await getMcpClient();
    const result = await client.callTool({
      name: toolName,
      arguments: args,
    });
    return result;
  } catch (error) {
    console.error(
      `❌ Error occurred when calling the tool ${toolName}:`,
      error
    );
    throw error;
  }
}

// -------------------- OLLAMA --------------------
async function generateOllamaResponse(prompt: string) {
  try {
    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: LLM_MODEL,
        prompt,
        stream: false,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data.response; // Ollama returns `{ response: "...", done: true }`
  } catch (error) {
    console.error("❌ Error calling Ollama:", error);
    throw error;
  }
}

// -------------------- CHAT LOOP --------------------
async function chatOnce(userMessage: string) {
  const tools = await getTools();

  // TODO: Fix this
  // const toolsForPrompt = tools
  //   .map((t: any) => {
  //     return `- ${t.name}: ${t.description}\n  inputSchema: ${JSON.stringify(
  //       t.inputSchema
  //     )}`;
  //   })
  //   .join("\n");

  const system = `You are an assistant with access to tools.
You may call exactly one tool at a time if needed.
When you want to call a tool, reply ONLY with a JSON block like:
{"tool":"<name>","arguments":{...}}
Do not add any other text.
When you have enough information to answer, reply in natural language.`;

  const prompt = `${system}

Available tools:
('getLatestRecord')

User: ${userMessage}

If you need a tool, output ONLY the JSON object described above.
If not, answer directly.`;

  const first = await generateOllamaResponse(prompt);

  const maybeTool = tryParseToolJson(first);
  if (!maybeTool) {
    console.log("\nAssistant:", first.trim());
    return;
  }
  console.log(
    `maybeTool = ${JSON.stringify(
      maybeTool
    )} typeof arguments = ${typeof maybeTool.arguments}  & arguments = ${
      maybeTool.arguments
    } `
  );
  // Tool execution
  // TODO: current maybeTool.arguments returns {"machineId":"welder-robot"} , we need to align with the MCP expectation format as {device: "MCH_1"}
  const toolResult = await callTool(maybeTool.tool, {
    machineId: "MCH_1",
  });

  // Final round with LLM
  const followup = `${system}

The tool call you made:
${JSON.stringify(maybeTool)}

Tool result (JSON):
${JSON.stringify(toolResult)}

Now explain the result to the user clearly.`;

  const final = await generateOllamaResponse(followup);
  console.log("\nAssistant:", final.trim());
}

// -------------------- JSON EXTRACTOR --------------------
function tryParseToolJson(
  text: string
): null | { tool: string; arguments: any } {
  const direct = text.trim();
  try {
    const parsed = JSON.parse(direct);
    if (parsed && typeof parsed === "object" && parsed.tool) {
      return parsed;
    }
  } catch {}

  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed && typeof parsed === "object" && parsed.tool) {
        return parsed;
      }
    } catch {}
  }

  return null;
}

// --- Demo runner ---
(async () => {
  const example = `Please get me the latest record of the machine 'MCH_1'`;
  try {
    await chatOnce(example);
  } catch (error) {
    console.error(`An error occurred when fetching the data ${error}`);
  }
})();
