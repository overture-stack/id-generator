import {DataSource} from "typeorm";
import {Donor} from "./models/donor";


export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    entities:[
        Donor
    ],
    synchronize: true,
    logging: true
});

console.log(AppDataSource.options);