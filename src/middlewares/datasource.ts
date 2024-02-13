import {
    Column,
    ColumnType,
    Connection,
    createConnection,
    CreateDateColumn,
    Entity, getConnectionManager,
    PrimaryGeneratedColumn
} from "typeorm";
import {NextFunction} from "express";


export interface SchemaInfo {
    tablename: string,
    columns: {name: string, type: ColumnType, defaultValue?: string}[],
    sequence: string
}

export let connection = {} as Connection;
const connectionManager = getConnectionManager();

export async function prepareDataSource(schema: SchemaInfo, requestId: number) {

    @Entity({
        name: schema.tablename
    })
    class DynamicEntity {

        @PrimaryGeneratedColumn()
        id: number;

        @CreateDateColumn({name: "created_at"})
        createdAt: Date;

        constructor() {
            schema.columns.forEach(({name, type, defaultValue}) => {
                this[name] = undefined
            });
        }
    }

    schema.columns.forEach(({name, type, defaultValue}) => {
        Column({type, default: () => defaultValue})(DynamicEntity.prototype, name);
    });

    if((!connectionManager.has(requestId.toString())) || (connectionManager.has(requestId.toString()) && (!connection.isConnected))){
        connection = await createConnection({
            type: 'postgres',
            name: requestId.toString(),
            host: process.env.DB_HOST,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT),
            database: process.env.DB_NAME,
            schema: process.env.DB_SCHEMA,
            entities: [DynamicEntity],
            synchronize: true,
            logging: true
        });
    }

    const repository = connection.getRepository(DynamicEntity);
    return repository;
}


export async function createSequences(sql: string){
        if(!((connectionManager.has("default")) && (connectionManager.get("default").isConnected))) {
            const connection = await createConnection({
                type: 'postgres',
                host: process.env.DB_HOST,
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                port: parseInt(process.env.DB_PORT),
                database: process.env.DB_NAME,
                schema: process.env.DB_SCHEMA,
                synchronize: true,
                logging: true
            });

            if(sql){
                await connection.query(sql);
            }
        }
    return true;
}

export async function closeDBConnection(next: NextFunction, requestId: number) {
    if(getConnectionManager().has(requestId.toString())) {
        const conn = getConnectionManager().get(requestId.toString());

        if (conn.isConnected) {
            await conn.close();
            console.log('DB conn closed');
        } else {
            console.log('DB conn already closed.');
        }
    }
}