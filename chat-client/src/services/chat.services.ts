import { MCPClient } from "../core/mcpClient";
import { OllamaClient } from "../core/ollamaClient";

export class ChatService {
  constructor(
    private readonly mcpClient: MCPClient,
    private readonly ollamaClient: OllamaClient
  ) {}

  async chat(userMessage: string): Promise<string> {
    const result = await this.mcpClient.listTools();
    const tools = Array.isArray(result.tools) ? result.tools : [result.tools];
    const toolsForPrompt = tools
      .map((t: any) => {
        return `- ${t.name}: ${t.description}\n  inputSchema: ${JSON.stringify(
          t.inputSchema
        )}`;
      })
      .join("\n");

    const system = `You are an assistant with access to tools.
You may call exactly one tool at a time if needed.
When you want to call a tool, reply ONLY with a JSON block like:
{"tool":"<name>","arguments":{...}}
Do not add any other text.
When you have enough information to answer, reply in natural language.`;

    const prompt = `${system}

Available tools: ${toolsForPrompt}

User: ${userMessage}`;

    const firstResponse = await this.ollamaClient.generate(prompt);

    const maybeTool = this.tryParseToolJson(firstResponse);
    if (!maybeTool) {
      return firstResponse.trim();
    }

    // Call the tool
    const toolResult = await this.mcpClient.callTool(
      maybeTool.tool,
      maybeTool.arguments
    );

    // Ask LLM to explain result
    const followup = `${system}

The tool call you made:
${JSON.stringify(maybeTool)}

Tool result (JSON):
${JSON.stringify(toolResult)}

Now explain the result to the user clearly.`;

    const finalResponse = await this.ollamaClient.generate(followup);
    return finalResponse.trim();
  }

  private tryParseToolJson(
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
}
