import { MCPClient } from "../core/mcpClient";

export class MachineService {
  constructor(private readonly mcpClient: MCPClient) {}

  async getLatestMachineRecord(machineId: string) {
    return this.mcpClient.callTool("get-machine-record", {
      machineId,
    });
  }

  async listMachines() {
    return this.mcpClient.callTool("listMachines", {});
  }
}
