import express from "express";
import cors from "cors";
import { ChatController } from "./controllers/chat.controller";
import { MachineController } from "./controllers/machines.controller";
import { MCPClient } from "./core/mcpClient";
import { OllamaClient } from "./core/ollamaClient";
import { ChatService } from "./services/chat.services";
import { MachineService } from "./services/machines.services";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  // Core clients
  const mcpClient = new MCPClient();
  const ollamaClient = new OllamaClient();

  // Services
  const chatService = new ChatService(mcpClient, ollamaClient);
  const machineService = new MachineService(mcpClient);

  // Controllers
  const chatController = new ChatController(chatService);
  const machineController = new MachineController(machineService);

  // Routes
  app.post("/chat", (req, res) => chatController.chat(req, res));
  app.get("/machines/:machineId", (req, res) =>
    machineController.getLatest(req, res)
  );
  app.get("/machines", (req, res) => machineController.list(req, res));

  return app;
}
