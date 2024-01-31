
import * as dotenv from "dotenv";

const config = dotenv.config();
if(config.error){
    console.log(`Error loading environment variables, aborting.`);
    process.exit(1);
}

const port = process.env.PORT


import * as express from 'express';
import {root} from "./routes/root";
import {getId} from "./services/donor-id-service"
import {AppDataSource} from "./data-source";


const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

function setupExpress(){
    app.use(cors({origin: true}));
    app.use(bodyParser.json());

    app.route("/").get(root);
    app.route("/donors/:programId/:submitterId").get(getId);

}

function startServer(){
    app.listen(port, () => {
            console.log(`HTTP REST API SERVER available at http://localhost:${port}`);
    });
}

AppDataSource.initialize()
            .then(() => {
                console.log(`Datasource initialized`);
                setupExpress();
                startServer();
            })
            .catch(err => {
                console.log(`Error during datasource initialization: ${err}`);
                process.exit(1)
            })

