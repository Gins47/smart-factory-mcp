import axios from "axios";

export class OllamaClient {
  private readonly baseUrl: string;
  private readonly model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_URL || "http://ollama:11434";
    this.model = process.env.MCP_MODEL || "llama3.1";
  }

  async generate(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.model,
          prompt,
          stream: false,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      return response.data.response;
    } catch (error) {
      console.error("Error calling Ollama:", error);
      throw error;
    }
  }
}
