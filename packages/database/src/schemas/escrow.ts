// import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// export const globalEscrowTransactions = sqliteTable('global_escrow_transactions', {
//   id: text('id').primaryKey(),                    // Escrow reference ID
//   sourceTenantId: text('source_tenant_id').notNull(), // e.g. Cooperative UUID
//   targetTenantId: text('target_tenant_id').notNull(), // e.g. Fleet Owner UUID
//   momoTransactionId: text('momo_transaction_id'), // Reference pointer from MTN MoMo / Vodafone Cash
//   heldAmountGhs: real('held_amount_ghs').notNull(),
//   disbursementStatus: text('disbursement_status', { 
//     enum: ['held', 'released_to_vendor', 'refunded_to_source'] 
//   }).default('held'),
//   createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
//   releasedAt: integer('released_at', { mode: 'timestamp' }),
// });