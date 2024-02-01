import {NextFunction, Request, Response} from 'express';
import {getDonorId} from "../services/donor-id-service";

export function root(request: Request, response: Response){
    response.status(200).send("<h3>Express server is up and running.</h3>")
}

export function getIdForEntity(request: Request, response: Response, next: NextFunction){
    const entityType = request.params.entityType;
    let id;
        if (entityType === "donor") {
          id   = getDonorId(request, response, next)
                    .then(id => response.status(200).json(id))
                    .catch(err => next(err));
        }

}
