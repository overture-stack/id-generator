import {
	Column,
	ColumnType,
	Connection,
	createConnection,
	CreateDateColumn,
	Entity,
	getConnectionManager,
	PrimaryGeneratedColumn,
	Unique,
} from 'typeorm';
import { NextFunction } from 'express';
import { z } from 'zod';
import * as config from '../config';

/*export interface SchemaInfo {
    tablename: string,
    columns: {name: string, type: ColumnType, defaultValue?: string, unique: boolean}[]
}*/

//type colType = 'float' | 'varchar' | 'number' | 'date' | 'varchar2' | 'string' | 'timestamp' | 'double' | 'boolean';

export interface SchemaInfo {
	tablename: string;
	columns: { name: string; type: ColumnType; defaultValue?: string; unique?: boolean }[];
	index: string[];
}

export let connection = {} as Connection;
const connectionManager = getConnectionManager();

export async function prepareDataSource(schema: SchemaInfo, requestId: number) {
	@Entity({
		name: schema.tablename,
	})
	@Unique('composite_index_' + schema.tablename, schema.index)
	class DynamicEntity {
		@PrimaryGeneratedColumn()
		id: number;

		@CreateDateColumn({ name: 'created_at' })
		createdAt: Date;

		constructor() {
			/*schema.columns.forEach(({ name, type, defaultValue, unique }) => {
				this[name] = undefined;
			});*/
			schema.columns.forEach(({ name, type, defaultValue, unique }) => {
				//const key = name as keyof typeof DynamicEntity;
				Column({ type, default: () => defaultValue, unique })(DynamicEntity.prototype, name);
			});
		}
	}

	schema.columns.forEach(({ name, type, defaultValue, unique }) => {
		const key = name as keyof typeof DynamicEntity;
		Column({ type, default: () => defaultValue, unique })(DynamicEntity.prototype, key);
	});

	if (
		!connectionManager.has(requestId.toString()) ||
		(connectionManager.has(requestId.toString()) && !connection.isConnected)
	) {
		connection = await createConnection({
			type: 'postgres',
			name: requestId.toString(),
			host: config.dbHost,
			username: config.dbUsername,
			password: config.dbPassword,
			port: config.dbPort,
			database: config.dbName,
			schema: config.dbSchema,
			synchronize: config.dbSync,
			logging: config.logging,
			entities: [DynamicEntity],
		});
	}

	const repository = connection.getRepository(DynamicEntity);
	return repository;
}

export async function createSequences(sql: string) {
	if (!(connectionManager.has('default') && connectionManager.get('default').isConnected)) {
		const connection = await createConnection({
			type: 'postgres',
			host: config.dbHost,
			username: config.dbUsername,
			password: config.dbPassword,
			port: config.dbPort,
			database: config.dbName,
			schema: config.dbSchema,
			synchronize: config.dbSync,
			logging: config.logging,
		});

		if (sql) {
			await connection.query(sql);
		}
	}
	return true;
}

export async function closeDBConnection(next: NextFunction, requestId: number) {
	if (getConnectionManager().has(requestId.toString())) {
		const conn = getConnectionManager().get(requestId.toString());

		if (conn.isConnected) {
			await conn.close();
			console.log('DB conn closed');
		} else {
			console.log('DB conn already closed.');
		}
	}
}

export function getTableDefinition(entity: string) {
	const schema = config.schemaDef.parse(JSON.parse(process.env[entity.toUpperCase() + `_SCHEMA`] || ''));
	return schema;
}

export function getSequenceDefinition() {
	const dbSeqArray = z.array(z.string());
	const sequences = config.dbSequences;
	return config.dbSequences;
}
