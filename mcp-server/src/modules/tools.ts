import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { Client } from "pg";

const pg = new Client({ connectionString: process.env.DATABASE_URL });

await pg.connect();

async function getLatestRecord(machineId: string) {
  try {
    const res = await pg.query(
      `SELECT * FROM energy_records
       WHERE machine_id = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [machineId]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error fetching latest record:", err);
    return null;
  }
}

export function registerTools(server: McpServer) {
  server.tool(
    "getLatestRecord",
    "Gets latest energy record for a machine",
    {
      machineId: z.string(),
    },

    async ({ machineId }) => {
      // Fetch data from MongoDB
      console.log(`Fetching temperature for device ${machineId}`);
      const energyRecord = await getLatestRecord(machineId);
      if (energyRecord) {
        console.log(`energyRecord = ${energyRecord}`);
        return {
          content: [{ type: "text", text: JSON.stringify(energyRecord) }],
        };
      } else {
        return {
          content: [{ type: "text", text: "[]" }],
        };
      }
    }
  );
}
