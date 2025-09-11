import { Client } from "pg";
import fs from "fs";
import csv from "csv-parser";

export async function seedDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS energy_records (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP NOT NULL,
      machine_id TEXT NOT NULL,
      operation_id TEXT NOT NULL,
      energy_kWh DOUBLE PRECISION,
      voltage_V DOUBLE PRECISION,
      current_A DOUBLE PRECISION,
      power_factor DOUBLE PRECISION,
      reactive_power_kVAR DOUBLE PRECISION,
      frequency_Hz DOUBLE PRECISION,
      machine_utilization_pct DOUBLE PRECISION,
      production_output_units INT,
      operator_count INT,
      material_usage_kg DOUBLE PRECISION,
      ambient_temp_C DOUBLE PRECISION,
      humidity_pct DOUBLE PRECISION,
      shift_type TEXT,
      production_mode TEXT,
      forecast_energy_kWh DOUBLE PRECISION,
      energy_state TEXT,
      allocation_recommendation TEXT
    );
  `);

  const check = await client.query("SELECT COUNT(*) FROM energy_records;");
  if (parseInt(check.rows[0].count, 10) > 0) {
    console.log("Table already has data, skipping seeding.");
    await client.end();
    return;
  }

  console.log("Seeding database...");
  const results: any[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream("data/industrial_energy.csv")
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  for (const row of results) {
    await client.query(
      `INSERT INTO energy_records
      (timestamp, machine_id, operation_id, energy_kWh, voltage_V, current_A, power_factor,
       reactive_power_kVAR, frequency_Hz, machine_utilization_pct, production_output_units,
       operator_count, material_usage_kg, ambient_temp_C, humidity_pct,
       shift_type, production_mode, forecast_energy_kWh, energy_state, allocation_recommendation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20);`,
      [
        row.timestamp,
        row.machine_id,
        row.operation_id,
        parseFloat(row.energy_kWh),
        parseFloat(row.voltage_V),
        parseFloat(row.current_A),
        parseFloat(row.power_factor),
        parseFloat(row.reactive_power_kVAR),
        parseFloat(row.frequency_Hz),
        parseFloat(row.machine_utilization_pct),
        parseInt(row.production_output_units, 10),
        parseInt(row.operator_count, 10),
        parseFloat(row.material_usage_kg),
        parseFloat(row.ambient_temp_C),
        parseFloat(row.humidity_pct),
        row.shift_type,
        row.production_mode,
        parseFloat(row.forecast_energy_kWh),
        row.energy_state,
        row.allocation_recommendation,
      ]
    );
  }

  console.log("✅ Seeding complete!");
  await client.end();
}
