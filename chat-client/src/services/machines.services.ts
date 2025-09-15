import { MCPClient } from "../core/mcpClient";

export class MachineService {
  constructor(private readonly mcpClient: MCPClient) {}

  async getLatestRecord(machineId: string) {
    return this.mcpClient.callTool("getLatestRecord", {
      machineId,
    });
  }

  async listMachines() {
    return this.mcpClient.callTool("listMachines", {});
  }
}
