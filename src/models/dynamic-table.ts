import {Column, ColumnType, Connection, createConnection, DataSource, Entity, PrimaryGeneratedColumn} from "typeorm";
import {ColumnOptions} from "typeorm/decorator/options/ColumnOptions";
import {Donor} from "./donor";
import {Specimen} from "./specimen";
import {Sample} from "./sample";
import {Treatment} from "./treatment";
import {PrimaryDiagnosis} from "./primary_diagnosis";
import {Chemotherapy} from "./chemotherapy";
import {HormoneTherapy} from "./hormone_therapy";
import {Repository} from "typeorm/repository/Repository";


export async function createTableAndRepo(tablename: string, columns: {name: string, type: ColumnType}[]){

    @Entity({
        name: tablename
    })
    class DynamicTable{

        @PrimaryGeneratedColumn()
        id: number;


        constructor(){
            columns.forEach(({name, type}) => {
                //console.log(this);
                this[name] = undefined
            });
        }

    }

    columns.forEach(({name, type}) => {
        Column({type })(DynamicTable.prototype, name);
    });

     const AppDataSource = new DataSource({
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
     })


    const repository = AppDataSource.getRepository(DynamicTable);
    return repository;

}



