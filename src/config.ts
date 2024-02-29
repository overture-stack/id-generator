import * as dotenv from 'dotenv';
import { z } from 'zod';
import { SchemaInfo } from './middlewares/datasource';

const config = dotenv.config();
if (config.error) {
	console.log(`Error loading environment variables, aborting.`);
	process.exit(1);
}

export const port = z
	.string({
		required_error: 'property PORT is required',
	})
	.trim()
	.min(1, { message: 'PORT cannot be empty' })
	.parse(process.env.PORT);

export const dbHost = z
	.string({
		required_error: 'property DB_HOST is required',
	})
	.trim()
	.min(1, { message: 'DB_HOST cannot be empty' })
	.parse(process.env.DB_HOST);

export const dbUsername = z
	.string({
		required_error: 'property DB_USERNAME is required',
	})
	.trim()
	.min(1, { message: 'DB_USERNAME cannot be empty' })
	.parse(process.env.DB_USERNAME);

export const dbPassword = z
	.string({
		required_error: 'property DB_PASSWORD is required',
	})
	.trim()
	.min(1, { message: 'DB_PASSWORD cannot be empty' })
	.parse(process.env.DB_PASSWORD);

export const dbPort = z
	.number({
		invalid_type_error: 'DB_PORT has to be a number',
	})
	.parse(
		parseInt(
			z
				.string({
					required_error: 'property DB_PORT is required',
				})
				.trim()
				.min(1, { message: 'DB_PORT cannot be empty' })
				.parse(process.env.DB_PORT),
		),
	);

export const dbSchema = z
	.string({
		required_error: 'property DB_SCHEMA is required',
	})
	.trim()
	.min(1, { message: 'DB_SCHEMA cannot be empty' })
	.parse(process.env.DB_SCHEMA);

export const dbName = z
	.string({
		required_error: 'property DB_NAME is required',
	})
	.trim()
	.min(1, { message: 'DB_NAME cannot be empty' })
	.parse(process.env.DB_NAME);

export const dbSync: boolean = JSON.parse(process.env.DB_SYNCHRONIZE || 'false');

export const logging: boolean = JSON.parse(process.env.DB_LOGGING || 'false');

export const requestRoute = z
	.string({
		required_error: 'property REQUEST_ROUTE is required',
	})
	.trim()
	.min(1, { message: 'REQUEST_ROUTE cannot be empty' })
	.parse(process.env['REQUEST_ROUTE']);

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
	.parse(JSON.parse(process.env[`DB_SEQUENCES`] || '[]')); // UK: check -> Unexpected token 'g', "g" is not valid JSON

export const schemaDef: z.ZodType<SchemaInfo> = z.object(
	{
		tablename: z
			.string({ required_error: 'table name is required' })
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
