
import * as express from 'express';
import {root} from "./routes/root";



const app = express();


function setExpress(){

    app.route("/").get(root)

}



function startServer(){
    app.listen(9000, () => {
            console.log(`HTTP REST API SERVER available at http://localhost:9000`);
    });
}

setExpress()
startServer()