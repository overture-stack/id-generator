
import {NextFunction, Request, Response} from "express"

function defaultErrorHandler(err, req: Request, res: Response, next: NextFunction){

    if(res.headersSent){
        return next(err);
    }

    res.status(500).json({
        status: "error",
        message: "Default error handler triggered"
    })
}