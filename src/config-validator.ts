import { z, ZodArray, ZodRecord, ZodString } from 'zod';
import { SchemaInfo } from './middlewares/datasource';

function getRequiredEnvVar(name: string) {
	const property = process.env[name] as any;
	if (!property || property.trim().length == 0) {
		throw new Error('config file is missing property ' + name);
	}
	return property;
}

export const getRequiredNumber = (name: string): number => {
	const value = parseInt(getRequiredEnvVar(name));
	const numberValue = z.number().finite().safeParse(value);
	if (!numberValue.success) {
		throw new Error('property ' + name + ' in config is not a valid number');
	}
	return numberValue.data;
};

export const getRequiredString = (name: string): string => {
	const value = getRequiredEnvVar(name);
	const stringValue = z.string().safeParse(value);
	if (!stringValue.success) {
		throw new Error('property ' + name + ' in config is not a valid string');
	}
	return stringValue.data;
};

export const getString = (name: string): string => {
	const value = process.env[name] || '';
	const stringValue = z.string().safeParse(value);
	if (!stringValue.success) {
		throw new Error('property ' + name + ' in config is not a valid string');
	}
	return stringValue.data;
};

export const getUrl = (name: string): string => {
	const value = process.env[name] || 'a://';
	const stringValue = z.string().url().safeParse(value);
	if (!stringValue.success) {
		throw new Error('property ' + name + ' in config is not a valid string');
	}
	return stringValue.data;
};

export const getRequiredArray = (name: string): ZodString['_output'][] => {
	const value = JSON.parse(process.env[name] || '[]');
	if (value.length == 0) {
		throw new Error('config file is missing property ' + name);
	}
	return getArray(name);
};

export const getArray = (name: string): ZodString['_output'][] => {
	const value = JSON.parse(process.env[name] || '[]');
	const stringArray = z.array(z.string()).safeParse(value);
	if (!stringArray.success) {
		throw new Error('config property ' + name + ' is not valid. Please provide an array of strings');
	}
	return stringArray.data;
};

export const getEnum = (name: string, enumList: string[]): string => {
	const zEnum = z.enum(['', ...enumList]);
	const value = process.env[name] || '';
	const stringValue = zEnum.safeParse(value);
	if (!stringValue.success) {
		throw new Error('property ' + name + ' in config is not a valid. Value should be one of ' + enumList.toString());
	}
	return stringValue.data;
};

export const getRecord = (name: string): ZodRecord<ZodString, ZodString> => {
	const config_entry = name.toUpperCase() + `_SCHEMA`;
	return z.record(
		z.string({ invalid_type_error: 'Invalid key in ' + config_entry + '. Should be a string' }),
		z.string({ invalid_type_error: 'Invalid value in ' + config_entry + '. Should be a string' }),
		{ invalid_type_error: 'Search criteria missing for entity <' + name + '> in the ENTITY_LIST' },
	);
};

export const getSchemaDef = (name: string): z.ZodType<SchemaInfo> => {
	const config_entry = name.toUpperCase() + `_SCHEMA`;
	return z.object(
		{
			tablename: z
				.string({
					required_error: 'table name in ' + config_entry + ' is required',
					invalid_type_error: 'table name in ' + config_entry + ' is invalid',
				})
				.trim()
				.min(1, { message: 'table name in ' + config_entry + ' cannot be empty' }),
			columns: z
				.array(
					z.object({
						name: z.string({ required_error: 'column name in ' + config_entry + ' is missing' }),
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
						defaultValue: z
							.string({ invalid_type_error: 'value for defaultValue in ' + config_entry + ' is invalid' })
							.optional(),
						unique: z.boolean({ invalid_type_error: 'value for unique in ' + config_entry + ' is invalid' }).optional(),
					}),
					{
						invalid_type_error: 'columns in ' + config_entry + ' should be an array',
					},
				)
				.nonempty({ message: 'column array in  ' + config_entry + ' should not be empty' }),
			/*index: z
				.array(
					z.string({
						invalid_type_error: 'index in  ' + config_entry + ' is invalid. It should be a list of column name strings',
					}),
					{
						invalid_type_error: 'index in  ' + config_entry + ' is invalid. It should be a list of column name strings',
						required_error: 'index in  ' + config_entry + ' is missing.',
					},
				)
				.nonempty({ message: 'index in ' + config_entry + ' is required' }),*/
			index: z
				.array(
					z.array(
						z.string({
							invalid_type_error:
								'index in  ' + config_entry + ' is invalid. It should be a list of column name strings',
						}),
						{
							invalid_type_error:
								'index in  ' + config_entry + ' is invalid. It should be a list of column name strings',
							required_error: 'index in  ' + config_entry + ' is missing.',
						},
					),
					{
						invalid_type_error:
							'index in  ' + config_entry + ' is invalid. It should be a list of list of column name strings',
						required_error: 'index in  ' + config_entry + ' is missing.',
					},
				)
				.nonempty({ message: 'index in ' + config_entry + ' is required' }),
		},
		{ invalid_type_error: 'Schema definition missing for entity <' + name + '> in the ENTITY_LIST' },
	);
};
