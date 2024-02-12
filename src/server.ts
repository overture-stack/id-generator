
import * as dotenv from "dotenv";

const config = dotenv.config();
if(config.error){
    console.log(`Error loading environment variables, aborting.`);
    process.exit(1);
}

const port = process.env.PORT

import * as express from 'express';
import {getIdForEntity, root} from "./routes/root";
//import {AppDataSource} from "./data-source";
import {defaultErrorHandler} from "./middlewares/error-handler";
import {getSchemaInfo} from "./services/id-service";
import {getConnectionAndRepo} from "./middlewares/repo-connection";


const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

function setupExpress(){
    app.use(cors({origin: true}));
    app.use(bodyParser.json());

    app.route("/").get(root);
    app.route("/:programId/:submitterId/:entityType").get(getIdForEntity);

    app.use(defaultErrorHandler);

}

function startServer(){
    app.listen(port, () => {
            console.log(`HTTP REST API SERVER available at http://localhost:${port}`);
    });
}

function initializeDB(){
    const entities: [] = JSON.parse(process.env["ENTITY_LIST"]);

    entities.forEach((entity) => {
        const  schemaInfo = getSchemaInfo(entity);
        const repo = getConnectionAndRepo(schemaInfo, 1)
                .then(() => console.log("DB initialized"))
                .catch(() => "Error upon DB initialization");
    })
}

setupExpress();
startServer();
initializeDB();

// --------------------------------------------
/*


export interface data {
    [key: string]: string;
}

let schemaInfo = {} as SchemaInfo;
let schemaInfo2 = {} as SchemaInfo;



const columns1: {name: string, type: ColumnType}[] = JSON.parse(process.env.DONOR_TABLE_COLUMNS)
const columns2: {name: string, type: ColumnType}[] = JSON.parse(process.env.SAMPLE_TABLE_COLUMNS)


schemaInfo.tablename =  process.env.DONOR_TABLE_NAME; //"TestTable1";
schemaInfo.columns = columns1;


schemaInfo2.tablename = process.env.SAMPLE_TABLE_NAME; ///"TestTable2";
const x = process.env[`SAMPLE_TABLE_NAME` ];
schemaInfo2.columns = columns2;

async function createData(repo: Repository<ObjectLiteral>, data: any) {
    await repo.save(data);
    //await destroyConnection();

}


const data1: data = {column1: "table1Value"};
getConnectionAndRepo(schemaInfo).then(repo => {createData(repo, data1)}) ;

const data2: data  = {column1: "table2Value1", column3: "table2Value3"}
getConnectionAndRepo(schemaInfo2).then(repo => {createData(repo, data2)}) ;

*/


// --------------------------------------------


