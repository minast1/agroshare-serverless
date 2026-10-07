import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// 1. Live Fleet Control Center (GPS Map Telemetry simulation)
// export const fleetAssets = sqliteTable('fleet_assets', {
//     id: text('id').primaryKey(),
//     assetName: text('asset_name').notNull(),               // e.g., 'John Deere 5075E'
//     assetType: text('asset_type', { enum: ['tractor', 'harvester', 'drone'] }).notNull(),
//     currentLatitude: real('current_latitude').notNull(),   // Map Mockup tracking coordinates
//     currentLongitude: real('current_longitude').notNull(),
//     operationalStatus: text('operational_status', { enum: ['idle', 'active', 'maintenance'] }).default('idle'),
// });

// // 2. Driver Dispatch Queue (Accept/Decline Workflow)
// export const dispatchRequests = sqliteTable('dispatch_requests', {
//     id: text('id').primaryKey(),
//     assetId: text('asset_id').references(() => fleetAssets.id),
//     requestingCoopId: text('requesting_coop_id').notNull(),
//     requestedService: text('requested_service').notNull(), // e.g., 'Plowing', 'Harrowing'
//     targetAcres: real('target_acres').notNull(),
//     offeredPayoutGhs: real('offered_payout_ghs').notNull(),
//     workflowState: text('workflow_state', { enum: ['pending', 'accepted', 'declined'] }).default('pending'),
//     createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
// });

// // 3. Maintenance Logbook Metric Grid
// export const assetLogs = sqliteTable('asset_logs', {
//     id: text('id').primaryKey(),
//     assetId: text('asset_id').references(() => fleetAssets.id),
//     operatingHours: real('operating_hours').notNull(),
//     fuelConsumedLiters: real('fuel_consumed_liters').notNull(),
//     acresWorked: real('acres_worked').notNull(),
//     fuelEfficiencyPerAcre: real('fuel_efficiency_per_acre').notNull(), // Liters per Acre (calculated)
//     loggedAt: integer('logged_at', { mode: 'timestamp' }).default(new Date()),
// });