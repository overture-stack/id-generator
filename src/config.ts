import * as dotenv from 'dotenv';
import {
	getArray,
	getRecord,
	getRequiredArray,
	getRequiredNumber,
	getRequiredString,
	getSchemaDef,
	getString,
	getUrl,
} from './config-validator.js';

if (dotenv.config().error) {
	console.log(`Error loading environment variables, aborting.`);
	process.exit(1);
}

export const dbHost = getRequiredString('DB_HOST'); //getRequiredEnvString('DB_HOST');
export const dbUsername = getRequiredString('DB_USERNAME');
export const dbPassword = getRequiredString('DB_PASSWORD');
export const dbSchema = getRequiredString('DB_SCHEMA');
export const dbName = getRequiredString('DB_NAME');
export const requestRoute = getRequiredString('REQUEST_ROUTE');

export const authScheme = getRequiredString('AUTH_SCHEME');
export const clientId = getRequiredString('CLIENT_ID');
export const clientSecret = getRequiredString('CLIENT_SECRET');

export const egoUrl = getUrl('EGO_URL');
export const keycloakUrl = getUrl('KEYCLOAK_URL');
export const keycloakResource = getString('KEYCLOAK_RESOURCE');

export const dbPort = getRequiredNumber('DB_PORT');
export const port = getRequiredNumber('PORT');

export const dbSync: boolean = JSON.parse(process.env.DB_SYNCHRONIZE || 'false');
export const logging: boolean = JSON.parse(process.env.DB_LOGGING || 'false');

export const entityList = getRequiredArray('ENTITY_LIST');
export const scopes = getRequiredArray('EGO_SCOPES');

export const dbSequences = getArray('DB_SEQUENCES');

entityList.forEach((entity) => {
	getSchemaDef(entity).parse(JSON.parse(process.env[entity.toUpperCase() + `_SCHEMA`] || '[]'));
});

entityList.forEach((entity) => {
	getRecord(entity).parse(JSON.parse(process.env[entity.toUpperCase() + `_SEARCH`] || '[]'));
});
