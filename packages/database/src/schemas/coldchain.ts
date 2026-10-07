// import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// // 1. Volumetric Capacity Monitor Nodes
// export const coolingNodes = sqliteTable('cooling_nodes', {
//   id: text('id').primaryKey(),
//   nodeName: text('node_name').notNull(),                // e.g., 'Blast Freezer Room A'
//   totalCapacityCubicMeters: real('total_capacity_cubic_meters').notNull(),
//   occupiedCapacityCubicMeters: real('occupied_capacity_cubic_meters').default(0),
// });

// // 2. IoT Temperature Telemetry Chart (Alert Flags)
// export const temperatureTelemetry = sqliteTable('temperature_telemetry', {
//   id: text('id').primaryKey(),
//   nodeId: text('node_id').references(() => coolingNodes.id),
//   temperatureCelsius: real('temperature_celsius').notNull(),
//   isBreached: integer('is_breached', { mode: 'boolean' }).default(false), // Triggers frontend Red Flash warning
//   recordedAt: integer('recorded_at', { mode: 'timestamp' }).default(new Date()),
// });

// // 3. Storage Billing & Check-in Ledger
// export const storageLedger = sqliteTable('storage_ledger', {
//   id: text('id').primaryKey(),
//   nodeId: text('node_id').references(() => coolingNodes.id),
//   depositorName: text('depositor_name').notNull(),
//   cratesCheckedIn: integer('crates_checked_in').notNull(),
//   checkInTime: integer('check_in_time', { mode: 'timestamp' }).notNull(),
//   checkOutTime: integer('check_out_time', { mode: 'timestamp' }), // Nullable until checkout
//   accruedCostGhs: real('accrued_cost_ghs').default(0),            // Accumulated duration cost
// });
