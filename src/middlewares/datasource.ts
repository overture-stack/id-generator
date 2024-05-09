import {
	Column,
	ColumnType,
	Connection,
	CreateDateColumn,
	DataSource,
	Entity,
	getConnectionManager,
	PrimaryGeneratedColumn,
	Unique,
} from 'typeorm';
import { NextFunction } from 'express';
import * as config from '../config.js';

export interface SchemaInfo {
	tablename: string;
	columns: { name: string; type: ColumnType; defaultValue?: string; unique?: boolean }[];
	index: string[];
}

const schemaInfo: SchemaInfo = new (class implements SchemaInfo {
	columns: { name: string; type: ColumnType; defaultValue?: string; unique?: boolean }[];
	index: string[];
	tablename: string;
})();


export let connection = {} as Connection;
const connectionManager = getConnectionManager();

export async function prepareDataSource(schema: SchemaInfo, requestId: number, dbSync: boolean) {
	@Entity({
		name: schema.tablename,
	})
	@Unique('composite_index_' + schema.tablename, schema.index)
	class DynamicEntity {
		@PrimaryGeneratedColumn()
		id: number;

		@CreateDateColumn({ name: 'created_at' })
		createdAt: Date;
	}

	schema.columns.forEach(({ name, type, defaultValue, unique }) => {
		const key = name as keyof typeof DynamicEntity;
		Column({ type, default: () => defaultValue, unique })(DynamicEntity.prototype, key);
	});

	const dataSourceConn = new DataSource({
		type: 'postgres',
		name: requestId.toString(),
		host: config.dbHost,
		username: config.dbUsername,
		password: config.dbPassword,
		port: config.dbPort,
		database: config.dbName,
		schema: config.dbSchema,
		synchronize: dbSync,
		logging: config.logging,
		entities: [DynamicEntity],
	});
	await dataSourceConn.initialize();
	const repository = dataSourceConn.getRepository(DynamicEntity);
	return repository;
}

export async function createSequences(sql: string) {
	if (sql) {
		(await getDBConnection('default')).query(sql);
	}
	return true;
}

export function getTableDefinition(entity: string) {
	const schema = config.schemaDefinitions.get(entity) || schemaInfo;
	return schema;
}

export async function initializeDBSequences() {
	const sequenceList = getSequenceDefinition();
	const sequenceInitializationPromises = sequenceList.map((seq) => {
		return createSequences(seq)
			.then(() => console.log('Sequence ' + seq + ' created'))
			.catch((err) => {
				console.log('Error executing statement: ' + seq);
				console.log(err);
				process.exit(1);
			});
	});
	await Promise.all(sequenceInitializationPromises);
}

export function getSequenceDefinition() {
	return config.dbSequences;
}

export async function initializeDB() {
	const entities = config.entityList;
	const dbInitializationPromises = entities.map((entity) => {
		const schemaInfo = getTableDefinition(entity);
		return prepareDataSource(schemaInfo, 1, true)
			.then(() => console.log('Entity ' + entity + ' initialized'))
			.catch(() => 'Error upon ' + entity + ' initialization');
	});
	await Promise.all(dbInitializationPromises);
}

export async function getDBConnection(name: string) {
	const dataSourceConn = new DataSource({
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
	await dataSourceConn.initialize();
	return dataSourceConn;
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
