import {NextFunction, Request, Response} from 'express';
import {getId} from "../services/id-service";
import {closeDBConnection} from "../middlewares/datasource";



export function root(request: Request, response: Response){
    response.status(200).send("<h3>Express server is up and running.</h3>")
}



export function getIdForEntity(request: Request, response: Response, next: NextFunction){

    const entityType = request.params.entityType;
    const requestId = Date.now();
    console.log(requestId);
    let id;
    id = getId(request, response, next, requestId).
            then(id => response.status(200).json(id))
            .catch(err => {
                closeDBConnection(next, requestId).then(() => console.log('DB conn closed'));
                next(err);
            });
    return id;

}
