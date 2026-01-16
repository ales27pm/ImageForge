import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { registerImageRoutes } from "./replit_integrations/image";

export async function registerRoutes(app: Express): Promise<Server> {
  registerImageRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
