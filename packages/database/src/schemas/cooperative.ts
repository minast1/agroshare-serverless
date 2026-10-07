import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
// 1. Digital Farmer Registry
export const farmers = sqliteTable('farmers', {
    id: text('id').notNull().primaryKey().$defaultFn(() => randomUUID()),
    fullName: text('full_name').notNull(),
    phoneNumber: text('phone_number').notNull().unique(), // E.164 string format (+233)
    locationHub: text('location_hub').notNull(),          // e.g., 'Techiman', 'Ejura'
    farmSizeAcres: real('farm_size_acres').notNull(),
    cropVariety: text('crop_variety').notNull(),          // e.g., 'White Maize', 'Aroma Rice'
    createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
});

// // 2. Bulk Supply Ordering (With Aggregated Calculators)
// export const bulkSupplyOrders = sqliteTable('bulk_supply_orders', {
//   id: text('id').primaryKey(),
//   cooperativeId: text('cooperative_id').notNull(),
//   itemType: text('item_type').notNull(),                // e.g., 'NPK Fertilizer Bag', 'Maize Seed'
//   quantityRequested: integer('quantity_requested').notNull(),
//   unitPriceGhs: real('unit_price_ghs').notNull(),
//   orderStatus: text('order_status', { enum: ['pending', 'aggregated', 'dispatched'] }).default('pending'),
//   updatedAt: integer('updated_at', { mode: 'timestamp' }).default(new Date()),
// });

// // 3. USSD Integration Hub Logger Card
// export const ussdRequestLogs = sqliteTable('ussd_request_logs', {
//   id: text('id').primaryKey(),
//   shortcodeCalled: text('shortcode_called').notNull(),  // e.g., '*714*45#'
//   msisdn: text('msisdn').notNull(),                     // Inbound farmer cell identity
//   rawInputString: text('raw_input_string').notNull(),   // e.g., '1*2'
//   menuStateReached: text('menu_state_reached').notNull(),
//   latencyMs: integer('latency_ms').notNull(),
//   timestamp: integer('timestamp', { mode: 'timestamp' }).default(new Date()),
// });