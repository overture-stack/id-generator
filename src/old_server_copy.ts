
import * as dotenv from "dotenv";

const config = dotenv.config();
if(config.error){
    console.log(`Error loading environment variables, aborting.`);
    process.exit(1);
}

const port = process.env.PORT

import * as express from 'express';
import {root} from "./routes/root";
//import {AppDataSource} from "./data-source";
import {defaultErrorHandler} from "./middlewares/error-handler";
import {Column, ColumnType, Entity, PrimaryColumn} from "typeorm";
import {destroyConnection, getConnectionAndRepo, SchemaInfo} from "./models/dynamic-table";
import {Repository} from "typeorm/repository/Repository";
import {ObjectLiteral} from "typeorm/common/ObjectLiteral";


const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

function setupExpress(){
    app.use(cors({origin: true}));
    app.use(bodyParser.json());

    app.route("/").get(root);
    app.use(defaultErrorHandler);

}

function startServer(){
    app.listen(port, () => {
            console.log(`HTTP REST API SERVER available at http://localhost:${port}`);
    });
}



// --------------------------------------------
//async function createSchema(){

    let schema: SchemaInfo[] = []

    let schemaInfo = {} as SchemaInfo;
    let schemaInfo2 = {} as SchemaInfo;



    /*const columns1: {name: string, type: ColumnType}[] = [
        {
        "name": "column1",
        "type": "varchar"
        },
        {
            "name": "column2",
            "type": "varchar"
        }
        ]*/


const columns1: {name: string, type: ColumnType}[] = JSON.parse(process.env.DONOR_TABLE_COLUMNS)
const columns2: {name: string, type: ColumnType}[] = JSON.parse(process.env.SAMPLE_TABLE_COLUMNS)
    /*const columns2: {name: string, type: ColumnType}[] = [
        {
            "name": "column1",
            "type": "varchar"
        },
        {
            "name": "column2",
            "type": "varchar"
        },
        {
            "name": "column3",
            "type": "varchar"
        }
    ]*/

    schemaInfo.tablename =  process.env.DONOR_TABLE_NAME; //"TestTable1";
    schemaInfo.columns = columns1;

    schema.push(schemaInfo);

    schemaInfo2.tablename = process.env.SAMPLE_TABLE_NAME; ///"TestTable2";
    schemaInfo2.columns = columns2;

    schema.push(schemaInfo2);

    //const repo = await createTableAndRepo("TestTable", columns);



  /*  return repos

}*/

async function createData(repo: Repository<ObjectLiteral>, data: any) {
    await repo.save(data);
    await destroyConnection();

}

/*const data1= {column1: "val1"};
getConnectionAndRepo(schemaInfo).then(repo => {
    repo.save(data1);
});*/

const data1 = {column1: "table1Value"};
getConnectionAndRepo(schemaInfo).then(repo => {createData(repo, data1)}) ;

const data2 = {column1: "table2Value1", column3: "table2Value3"}
getConnectionAndRepo(schemaInfo2).then(repo => {createData(repo, data2)}) ;




/*const repositories = createSchema();
const repoOp1 =  repositories.then(repos => {createData(repos["TestTable1"]).catch()});
const repoOp2 =  repositories.then(repos => {createData(repos["TestTable2"]).catch()});*/
//createData(repositories["TestTable1"]).catch()
/*repositories.then(rep => {
    createData(rep["TestTable2"])
})*/


//createData(createSchema())

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

