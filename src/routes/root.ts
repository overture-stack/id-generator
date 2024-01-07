import {Request, Response} from 'express';

export function root(request: Request, response: Response){

    response.status(200).send("<h3>Express server is up and running.</h3>")
}