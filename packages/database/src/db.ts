import { createClient } from "@tursodatabase/serverless/compat";
import type { Client } from "@tursodatabase/serverless/compat";


export type TenantConfig = {
    db_url: string;
    auth_token: string;
}

export function getTenantDBClient(config: TenantConfig): Client {
    return createClient({
        url: config.db_url,
        authToken: config.auth_token
    });
}