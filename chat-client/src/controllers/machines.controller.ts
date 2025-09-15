import { Request, Response } from "express";
import { MachineService } from "../services/machines.services";

export class MachineController {
  constructor(private readonly machineService: MachineService) {}

  async getLatest(req: Request, res: Response) {
    try {
      const { machineId } = req.params;
      console.log(`Getting latest record of machine ${machineId}`);
      const result = await this.machineService.getLatestRecord(machineId);
      res.json(result);
    } catch (err) {
      console.error("Machine error:", err);
      res.status(500).json({ error: "Failed to fetch machine record" });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const result = await this.machineService.listMachines();
      res.json(result);
    } catch (err) {
      console.error("Machine list error:", err);
      res.status(500).json({ error: "Failed to list machines" });
    }
  }
}
