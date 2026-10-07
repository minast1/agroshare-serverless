
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { Table } from 'dynamodb-toolbox/table'
import { Entity } from 'dynamodb-toolbox/entity'
import { item } from 'dynamodb-toolbox/schema/item'
import { string } from 'dynamodb-toolbox/schema/string'

const dynamoDBClient = new DynamoDBClient({
    region: 'eu-east-1'
})
const documentClient = DynamoDBDocumentClient.from(
    dynamoDBClient,
    {
        marshallOptions: {
            removeUndefinedValues: true,
            convertEmptyValues: false
        }
    }
)
export const RegistryTable = new Table({
    name: process.env.REGISTRY_TABLE_NAME || "AgroShare_Tenant_Registry",
    partitionKey: {
        name: 'lookupKey',
        type: 'string',
    },
    documentClient,
})

export const TenantRouteEntity = new Entity({
    name: 'TenantRouteEntity',
    table: RegistryTable,
    schema: item({
        lookupKey: string().key(),
        tenantId: string().required(),
        tenantType: string().enum('cooperative', 'fleet', 'coldchain').required(),
        dbUrl: string().required(),
        cretedAt: string().default(() => new Date().toISOString())
    })
})

export { PutItemCommand } from 'dynamodb-toolbox/entity/actions/put';
export { GetItemCommand } from 'dynamodb-toolbox/entity/actions/get';
export type { PutItemInput } from 'dynamodb-toolbox/entity/actions/put';