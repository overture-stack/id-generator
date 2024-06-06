import * as dotenv from 'dotenv';
import {
	getArray,
	getRecord,
	getRequiredArray,
	getRequiredNumber,
	getRequiredString,
	getSchemaDef,
	getUrl,
} from './config-validator.js';
import { SchemaInfo } from './middlewares/datasource';
import {RecordType} from "zod";

if (dotenv.config().error) {
	console.log(`Error loading environment variables, aborting.`);
	process.exit(1);
}

export const dbHost = getRequiredString('DB_HOST');
export const dbUsername = getRequiredString('DB_USERNAME');
export const dbPassword = getRequiredString('DB_PASSWORD');
export const dbSchema = getRequiredString('DB_SCHEMA');
export const dbName = getRequiredString('DB_NAME');
export const requestRoute = getRequiredString('REQUEST_ROUTE');

export const egoUrl = getUrl('EGO_URL');

export const dbPort = getRequiredNumber('DB_PORT');
export const port = getRequiredNumber('PORT');

export const dbSync: boolean = JSON.parse(process.env.DB_SYNCHRONIZE || 'false');
export const logging: boolean = JSON.parse(process.env.DB_LOGGING || 'false');

export const entityList = getRequiredArray('ENTITY_LIST');
export const scopes = getRequiredArray('SCOPES');

export const dbSequences = getArray('DB_SEQUENCES');

export const schemaDefinitions: Map<string, SchemaInfo> = new Map<string, SchemaInfo>();
entityList.forEach((entity) => {
	const parseResult = getSchemaDef(entity).safeParse(JSON.parse(process.env[`${entity.toUpperCase()}_SCHEMA`] || '[]'));
	if (!parseResult.success) {
		const message = JSON.stringify(parseResult.error.flatten());
		throw new Error(`Environment value for "${entity}" is invalid with the following errors: ${message}`);
	}
	schemaDefinitions.set(entity, parseResult.data);
});

export const searchCriterias = new Map<string, RecordType<string, string>>();
entityList.forEach((entity) => {
	const rec = getRecord(entity).parse(JSON.parse(process.env[`${entity.toUpperCase()}_SEARCH`] || '[]'));
	searchCriterias.set(entity, rec);
});