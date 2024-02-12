import {Column, ColumnType, Connection, createConnection, DataSource, Entity, PrimaryGeneratedColumn} from "typeorm";
import {ColumnOptions} from "typeorm/decorator/options/ColumnOptions";
import {Repository} from "typeorm/repository/Repository";
import {ObjectLiteral} from "typeorm/common/ObjectLiteral";


export interface SchemaInfo {
tablename: string, columns: {name: string, type: ColumnType, default?: string}[]
}

export interface RepositoryInfo {
    [key: string]: Repository<ObjectLiteral>;
}


export let connection = {} as Connection;

//export async function getConnectionAndRepo(tablename: string, columns: {name: string, type: ColumnType}[]){
export async function getConnectionAndRepo(schema: SchemaInfo){

    @Entity({
        name: schema.tablename
    })
    class DynamicTable{

        @PrimaryGeneratedColumn()
        id: number;

        constructor(){
            schema.columns.forEach(({name, type}) => {
                //console.log(this);
                this[name] = undefined
            });
        }
    }

    schema.columns.forEach(({name, type}) => {
        Column({type, default: () => `nextval('idGen.donor_seq')`})(DynamicTable.prototype, name);
    });

     /*const AppDataSource = new DataSource({
        type: "postgres",
        host: process.env.DB_HOST,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT),
        database: process.env.DB_NAME,
        schema: process.env.DB_SCHEMA,
        entities:[
            DynamicTable
        ],
        synchronize: true,
        logging: true
    });


     AppDataSource.initialize().catch(err => {
         console.log(`Error during datasource initialization: ${err}`);
         process.exit(1)
     })*/

     connection = await createConnection({
        type: 'postgres',
        host: process.env.DB_HOST,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT),
        database: process.env.DB_NAME,
        schema: process.env.DB_SCHEMA,
        entities: [DynamicTable],
        synchronize: true,
    });


    //const repository = AppDataSource.getRepository(DynamicTable);
    const repository = connection.getRepository(DynamicTable);
    return repository;

}

export async function destroyConnection(){
    await connection.destroy();
}



/*export async function createTableAndRepo(schema: SchemaInfo[]){

    let repositories:RepositoryInfo = {};

    for (const sch of schema) {

        @Entity({
            name: sch.tablename
        })
        class DynamicTable{

            @PrimaryGeneratedColumn()
            id: number;

            constructor(){
                sch.columns.forEach(({name, type}) => {
                    //console.log(this);
                    this[name] = undefined
                });
            }
        }

        sch.columns.forEach(({name, type}) => {
            Column({type, default: () => `nextval('idGen.donor_seq')`})(DynamicTable.prototype, name);
        });




        if(Object.keys(connection).length === 0) {
            connection = await createConnection({
                type: 'postgres',
                host: process.env.DB_HOST,
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                port: parseInt(process.env.DB_PORT),
                database: process.env.DB_NAME,
                schema: process.env.DB_SCHEMA,
                entities: [DynamicTable],
                synchronize: true,
            });
        }

        const repository = connection.getRepository(DynamicTable);
        repositories[sch.tablename]=repository;

    }


    return repositories;


}*/


