
import * as dotenv from "dotenv";

const config = dotenv.config();
if(config.error){
    console.log(`Error loading environment variables, aborting.`);
    process.exit(1);
}

const port = process.env.PORT

import * as express from 'express';
import {getIdForEntity, root} from "./routes/root";
import {defaultErrorHandler} from "./middlewares/error-handler";
import {getSchemaInfo} from "./services/id-service";
import {createSequences, prepareDataSource} from "./middlewares/datasource";


const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

function setupExpress(){
    app.use(cors({origin: true}));
    app.use(bodyParser.json());

    app.route("/").get(root);
    app.route(process.env["REQUEST_ROUTE"]).get(getIdForEntity);
    app.use(defaultErrorHandler);

}

function startServer(){
    app.listen(port, () => {
            console.log(`HTTP REST API SERVER available at http://localhost:${port}`);
    });
}

async function initializeDB(){
    const entities: [] = JSON.parse(process.env["ENTITY_LIST"]);
    entities.forEach((entity) => {
        const  schemaInfo = getSchemaInfo(entity);
        const repo = prepareDataSource(schemaInfo, 1)
                .then(() => console.log("Entity "+ entity +" initialized"))
                .catch(() => "Error upon "+ entity +" initialization");
    })
}

async function initializeDBSequences(){
    const entities: [] = JSON.parse(process.env["ENTITY_LIST"]);
    entities.forEach((entity) => {
        const  schemaInfo = getSchemaInfo(entity);
        const seq = createSequences(schemaInfo.sequence)
            .then(() => console.log("Sequence "+ entity +" created"))
            .catch((err) => console.log("Error "+err+" upon "+ entity +" sequence creation"));
    })
}

async function main() {
    try {
        await initializeDBSequences();
        await initializeDB();
        await setupExpress();
        await startServer();

        console.log('Server started successfully');
    } catch (error) {
        console.error('Error starting server:', error);
    }
}


main();



