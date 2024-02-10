
import * as dotenv from "dotenv";

const config = dotenv.config();
if(config.error){
    console.log(`Error loading environment variables, aborting.`);
    process.exit(1);
}

const port = process.env.PORT

import * as express from 'express';
import {getIdForEntity, root} from "./routes/root";
import {AppDataSource} from "./data-source";
import {defaultErrorHandler} from "./middlewares/error-handler";
import {Column, ColumnType, Entity, PrimaryColumn} from "typeorm";
import {createTableAndRepo} from "./models/dynamic-table";
import {Repository} from "typeorm/repository/Repository";
import {ObjectLiteral} from "typeorm/common/ObjectLiteral";


const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

function setupExpress(){
    app.use(cors({origin: true}));
    app.use(bodyParser.json());

    app.route("/").get(root);
    app.route("/:entityType/:programId/:submitterId").get(getIdForEntity);
    app.use(defaultErrorHandler);

}

function startServer(){
    app.listen(port, () => {
            console.log(`HTTP REST API SERVER available at http://localhost:${port}`);
    });
}



// --------------------------------------------
async function createSchema(){

    const columns: {name: string, type: ColumnType}[] = [{
        "name": "column1",
        "type": "string"
    },
        {
            "name": "column2",
            "type": "string"
        }]

    const repo = await createTableAndRepo("TestTable", columns);
    return repo;

}

async function createData(repo: Promise<Repository<ObjectLiteral>>) {
    const data= {column1: "val1", column2: "val2"};

    (await repo).save(data).catch()
}



createData(createSchema()).catch();


// --------------------------------------------


/*AppDataSource.initialize()
            .then(() => {
                console.log(`Datasource initialized`);
                setupExpress();
                startServer();
            })
            .catch(err => {
                console.log(`Error during datasource initialization: ${err}`);
                process.exit(1)
            })*/

