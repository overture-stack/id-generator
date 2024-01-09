
import * as dotenv from "dotenv";

const config = dotenv.config();
if(config.error){
    console.log(`Error loading environment variables, aborting.`);
    process.exit(1);
}

const port = process.env.PORT


import * as express from 'express';
import {root} from "./routes/root";
import {AppDataSource} from "./data-source";

const app = express();

function setExpress(){
    app.route("/").get(root);
}

function startServer(){
    app.listen(port, () => {
            console.log(`HTTP REST API SERVER available at http://localhost:${port}`);
    });
}

AppDataSource.initialize()
            .then(() => {
                console.log(`Datasource initialized`);
                setExpress();
                startServer();
            })
            .catch(err => {
                console.log(`Error during datasource initialization: ${err}`);
                process.exit(1)
            })

