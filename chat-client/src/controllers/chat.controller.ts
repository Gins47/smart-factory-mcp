import { Request, Response } from "express";
import { ChatService } from "../services/chat.services";

export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  async chat(req: Request, res: Response) {
    try {
      const { message } = req.body;
      const reply = await this.chatService.chat(message);
      res.json({ reply });
    } catch (err) {
      console.error("❌ Chat error:", err);
      res.status(500).json({ error: "Chat failed" });
    }
  }
}
