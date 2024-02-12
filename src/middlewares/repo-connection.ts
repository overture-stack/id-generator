import {
    Column,
    ColumnType,
    Connection,
    createConnection,
    CreateDateColumn,
    Entity, getConnectionManager,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {NextFunction} from "express";



export interface SchemaInfo {
    tablename: string,
    columns: {name: string, type: ColumnType, defaultValue?: string}[]
}

export let connection = {} as Connection;

export async function getConnectionAndRepo(schema: SchemaInfo, requestId: number) {

    @Entity({
        name: schema.tablename
    })
    class DynamicTable {

        @PrimaryGeneratedColumn()
        id: number;

        @CreateDateColumn({name: "created_at"})
        createdAt: Date;

        @UpdateDateColumn({name: "updated_at"})
        updateAt: Date;

        constructor() {
            schema.columns.forEach(({name, type, defaultValue}) => {
                this[name] = undefined
            });
        }
    }

    schema.columns.forEach(({name, type, defaultValue}) => {
        //Column({type, default: () => `nextval('idGen.donor_seq')`})(DynamicTable.prototype, name);
        Column({type, default: () => defaultValue})(DynamicTable.prototype, name);
    });


    if(!getConnectionManager().has(requestId.toString())){
            connection = await createConnection({
                type: 'postgres',
                name: requestId.toString(),
                host: process.env.DB_HOST,
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                port: parseInt(process.env.DB_PORT),
                database: process.env.DB_NAME,
                schema: process.env.DB_SCHEMA,
                entities: [DynamicTable],
                synchronize: true,
                logging: true
            });
}else{
        connection = getConnectionManager().get(requestId.toString());
        if(!connection.isConnected) {
            connection = await createConnection({
                type: 'postgres',
                name: requestId.toString(),
                host: process.env.DB_HOST,
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                port: parseInt(process.env.DB_PORT),
                database: process.env.DB_NAME,
                schema: process.env.DB_SCHEMA,
                entities: [DynamicTable],
                synchronize: true/*,
                logging: true*/
            });
        }
    }

    const repository = connection.getRepository(DynamicTable);
    return repository;
}


export async function destroyConnection(){
    await connection.destroy();
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