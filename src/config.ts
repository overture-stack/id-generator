import * as dotenv from 'dotenv';
import {
	getArray,
	getEnum,
	getRecord,
	getRequiredArray,
	getRequiredNumber,
	getRequiredString,
	getSchemaDef,
	getString,
	getUrl, validateArrayContents,
} from './config-validator.js';
import { SchemaInfo } from './middlewares/datasource.js';
import {RecordType, z} from "zod";
import {apiList, authList, AuthStrategy, SecuredApi} from "./middlewares/autorization/auth-types.js";

if (dotenv.config().error) {
	console.log(`Error loading environment variables, aborting.`);
	process.exit(1);
}

export const publicKeyCache = getString('AUTH_PUBLICKEY_CACHE') || '1h';

export const dbHost = getRequiredString('DB_HOST');
export const dbUsername = getRequiredString('DB_USERNAME');
export const dbPassword = getRequiredString('DB_PASSWORD');
export const dbSchema = getRequiredString('DB_SCHEMA');
export const dbName = getRequiredString('DB_NAME');
export const requestRoute = getRequiredString('REQUEST_ROUTE');
export const clientId = getRequiredString('AUTH_SERVER_CLIENT_ID');
export const clientSecret = getRequiredString('AUTH_SERVER_CLIENT_SECRET');

export const authServerUrl = getUrl('AUTH_SERVER_URL');

export const dbPort = getRequiredNumber('DB_PORT');
export const port = getRequiredNumber('PORT');

export const dbSync: boolean = JSON.parse(process.env.DB_SYNCHRONIZE || 'false');
export const logging: boolean = JSON.parse(process.env.DB_LOGGING || 'false');

export const entityList = getRequiredArray('ENTITY_LIST');

export const scopes = getArray('AUTH_WRITE_SCOPES');
export const dbSequences = getArray('DB_SEQUENCES');

export const securedApi = getArray('SECURED_API');
securedApi.forEach(api => {validateArrayContents('SECURED_API', z.enum(apiList), api)});

export const authStrategy: AuthStrategy = getEnum('AUTH_STRATEGY', z.enum(authList));

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