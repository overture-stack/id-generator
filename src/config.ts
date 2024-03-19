import * as dotenv from 'dotenv';
import {z, ZodString} from 'zod';
import { SchemaInfo } from './middlewares/datasource.js';
import {getRequiredEnvNumber, getRequiredEnvString} from "./validations.js";

if (dotenv.config().error) {
	console.log(`Error loading environment variables, aborting.`);
	process.exit(1);
}


export const dbHost = getRequiredEnvString('DB_HOST');//getRequiredEnvString('DB_HOST');

export const dbUsername = getRequiredEnvString('DB_USERNAME');

export const dbPassword = getRequiredEnvString('DB_PASSWORD');

export const dbSchema = getRequiredEnvString('DB_SCHEMA');

export const dbName = getRequiredEnvString('DB_NAME');

export const requestRoute = getRequiredEnvString('REQUEST_ROUTE');


export const dbPort = getRequiredEnvNumber('DB_PORT');
export const port = getRequiredEnvNumber('PORT');


export const dbSync: boolean = JSON.parse(process.env.DB_SYNCHRONIZE || 'false');

export const logging: boolean = JSON.parse(process.env.DB_LOGGING || 'false');




export const entityList = z
	.array(
		z.string({
			invalid_type_error: 'ENTITY_LIST should be an array of strings',
		}),
		{
			invalid_type_error: 'ENTITY_LIST should be an array of strings',
		},
	)
	.nonempty('ENTITY_LIST is required and cannot be empty')
	.parse(JSON.parse(process.env['ENTITY_LIST'] || '[]'));


export const dbSequences = z
	.array(z.string(), {
		invalid_type_error: 'DB_SEQUENCES should be an array',
	})
	.parse(JSON.parse(process.env[`DB_SEQUENCES`] || '[``]')); // UK: check -> Unexpected token 'g', "g" is not valid JSON


export const schemaDef: z.ZodType<SchemaInfo> = z.object(
	{
		tablename: z
			.string({ required_error: 'table name is required', invalid_type_error: 'invalid table name ' })
			.trim()
			.min(1, { message: 'table name cannot be empty' }),
		columns: z
			.array(
				z.object({
					name: z.string({ required_error: 'column name is missing' }),
					type: z.union([
						z.literal('float'),
						z.literal('varchar'),
						z.literal('number'),
						z.literal('date'),
						z.literal('varchar2'),
						z.literal('string'),
						z.literal('timestamp'),
						z.literal('double'),
						z.literal('boolean'),
					]),
					defaultValue: z.string({ invalid_type_error: 'invalid value for defaultValue' }).optional(),
					unique: z.boolean({ invalid_type_error: 'invalid value for unique' }).optional(),
				}),
				{
					invalid_type_error: 'Schema Columns should be an array',
				},
			)
			.nonempty({ message: 'Schema columns array should not be empty' }),
		index: z
			.array(z.string({ invalid_type_error: 'Please provide a list of column name string' }), {
				invalid_type_error: 'Please provide a list of column name strings',
			})
			.nonempty({ message: 'A composite index is required for each entity' }),
	},
	{ invalid_type_error: 'Schema definition missing for an entity in the ENTITY_LIST' },
);

entityList.forEach((entity) => {
	schemaDef.parse(JSON.parse(process.env[entity.toUpperCase() + `_SCHEMA`] || '[]'));
});



export const searchCriteria = z.record(
	z.string({ invalid_type_error: 'Search criteria key should be a string' }),
	z.string({ invalid_type_error: 'Search criteria value should be a string' }),
	{ invalid_type_error: 'Search criteria missing for an entity in the ENTITY_LIST' },
);

entityList.forEach((entity) => {
	searchCriteria.parse(JSON.parse(process.env[entity.toUpperCase() + `_SEARCH`] || '[]'));
});


export const egoUrl = z
	.string({
		invalid_type_error: 'EGO_URL should be a string',
	})
	.parse(process.env['EGO_URL']);



export const scopes = z
	.array(
		z.string({
			invalid_type_error: 'SCOPES should be an array of strings',
		}),
		{
			invalid_type_error: 'SCOPES should be an array of strings',
		},
	)
	.parse(JSON.parse(process.env[`SCOPES`] || ""));
