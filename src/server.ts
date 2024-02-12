
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
import {prepareDataSource} from "./middlewares/datasource";


const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

function setupExpress(){
    app.use(cors({origin: true}));
    app.use(bodyParser.json());

    app.route("/").get(root);
    //app.route("/:programId/:submitterId/:entityType").get(getIdForEntity);
    app.route(process.env["REQUEST_ROUTE"]).get(getIdForEntity);
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
        const repo = prepareDataSource(schemaInfo, 1)
                .then(() => console.log("Entity "+ entity +" initialized"))
                .catch(() => "Error upon "+ entity +" initialization");
    })
}

setupExpress();
startServer();
initializeDB();


