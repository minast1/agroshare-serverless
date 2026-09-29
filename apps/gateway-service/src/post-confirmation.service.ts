import { Injectable, Logger } from '@nestjs/common';
import { createClient } from '@tursodatabase/api';
import { PostConfirmationTriggerEvent } from 'aws-lambda';
import {
  cooperativeMigrations,
  fleetMigrations,
  coldchainMigrations
} from '@repo/database/migrations-registry';
import { getTenantDBClient } from "@repo/database/db";
import {
  TenantRouteEntity,
  PutItemCommand,
  PutItemInput
} from '@repo/database/registry-dynamo';



@Injectable()
export class PostConfirmationService {
  private readonly logger = new Logger(PostConfirmationService.name);
  private readonly tursoPlatformAPI: ReturnType<typeof createClient>;

  constructor() {
    this.tursoPlatformAPI = createClient({
      org: 'personal',
      token: process.env.TURSO_PLATFORM_API_KEY || ''
    });
  }
  async handlePostConfirmation(event: PostConfirmationTriggerEvent) {
    this.logger.log('PostConfirmation Trigger: ', event);

    const tenantId = event.request.userAttributes['custom:tenant_id']
    const tenantType = event.request.userAttributes['custom:tenant_type'];

    this.logger.log(`Starting dynamic db provisioning for tenant: ${tenantId}, of type ${tenantType} `)

    try {
      const dbUrl = await this.createCloudDatabase(tenantId);
      this.logger.log(`Database provisioned with URL: ${dbUrl}`);
      await this.applyDynamicCloudMigrations(dbUrl, tenantType);

    } catch (error) {
      this.logger.error('Error provisioning database:', error);
      throw error;
    }

    return event;
  }

  private async createCloudDatabase(tenantId: string): Promise<string> {

    const dbMetadata = await this.tursoPlatformAPI.databases.create(tenantId, {
      group: 'default',
    });
    return `libsql://${dbMetadata.hostname}`;
  }

  private async applyDynamicCloudMigrations(dbUrl: string, tenantType: string): Promise<void> {
    this.logger.log(`Connecting to new isolated tenant cloud node: ${dbUrl}`);
    let migrationList: Array<{ name: string, sql: string }> = [];

    if (tenantType === 'cooperative') {
      migrationList = cooperativeMigrations;
    } else if (tenantType === 'fleet') {
      migrationList = fleetMigrations;
    } else if (tenantType === 'coldchain') {
      migrationList = coldchainMigrations;
    } else {
      throw new Error(`Invalid tenant type provided: ${tenantType}`);
    }

    if (migrationList.length === 0) {
      this.logger.warn(`No migration statements registered for tenant group profile: ${tenantType}`);
      return;
    }

    const client = getTenantDBClient({
      db_url: dbUrl,
      auth_token: process.env.TURSO_API_TOKEN!,
    });

    try {
      this.logger.log(`Processing ${migrationList.length} files chronologically for ${tenantType}`);
      for (const migrationFile of migrationList) {
        this.logger.log(`Applying script file container: ${migrationFile.name}`);

        const statements = migrationFile.sql
          .split('--> statement-breakpoint')
          .map((statement) => statement.trim())
          .filter(Boolean);

        for (const statement of statements) {
          await client.execute(statement);
        }
        this.logger.log(`Successfully ran sequence blocks inside: ${migrationFile.name}`);
      }
    } catch (err) {
      this.logger.error(`Database structural deployment step failed on cloud cluster ${dbUrl}`, err);
      throw err;
    } finally {
      client.close();
    }
  }

  private async registerTenantRoute(
    lookupKey: string,
    tenantId: string,
    tenantType: 'cooperative' | 'fleet' | 'coldchain',
    dbUrl: string
  ): Promise<void> {

    try {
      const item: PutItemInput<typeof TenantRouteEntity> =
      {
        lookupKey: lookupKey,
        tenantId: tenantId,
        tenantType: tenantType,
        dbUrl: dbUrl,
        cretedAt: new Date().toISOString()
      }

      await TenantRouteEntity.build(PutItemCommand)
        .item(item).send();

      this.logger.log(`Successfully registered tenant route for tenant: ${tenantId}`);
    } catch (error) {

    }
  }
}

