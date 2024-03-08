import {NextFunction, Request, Response} from "express";
import {IdGenerationError, UnauthorizedError} from "./error-handler.js";
import jwt from 'jsonwebtoken';
import memoize from 'memoizee';
import axios from 'axios';
import ms from 'ms';

const getKey = memoize(
    async (egoURL: string) => {
        const response = await axios.get(egoURL);
        return response.data;
    },
    {
        maxAge: ms('1h'),
        preFetch: true,
    },
);

const verifyEgoToken = async (token: string, egoURL: string) => {
    //const key = await getKey("https://ego.argo-qa.cumulus.genomeinformatics.org/api/oauth/token/public_key");
    const key = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0lOqMuPLCVusc6szklNXQL1FHhSkEgR7An+8BllBqTsRHM4bRYosseGFCbYPn8r8FsWuMDtxp0CwTyMQR2PCbJ740DdpbE1KC6jAfZxqcBete7gP0tooJtbvnA6X4vNpG4ukhtUoN9DzNOO0eqMU0Rgyy5HjERdYEWkwTNB30i9I+nHFOSj4MGLBSxNlnuo3keeomCRgtimCx+L/K3HNo0QHTG1J7RzLVAchfQT0lu3pUJ8kB+UM6/6NG+fVyysJyRZ9gadsr4gvHHckw8oUBp2tHvqBEkEdY+rt1Mf5jppt7JUV7HAPLB/qR5jhALY2FX/8MN+lPLmb/nLQQichVQIDAQAB\n-----END PUBLIC KEY-----";
    return jwt.verify(token, key);
};



export async function egoAuthHandler(req: Request, res: Response, next: NextFunction) {
    console.log("auth handler called");

    const header = req.headers;
    const { authorization: authorizationHeader } = req.headers;
    const { authorization: authorizationBody } = req.body || {};

    const authorization = authorizationHeader || authorizationBody;
    const bearerToken: string = authorization ? authorization.split(' ')[1] : req.query.key;

    let valid = false;
    try {
        valid = !!(bearerToken && (await verifyEgoToken(bearerToken, 'egoURL')));
    } catch (e) {
        console.error(e);
        valid = false;
    }

    if (!valid) {
        next(new UnauthorizedError('You need to be authenticated for this request.'));
    }
    else {
        // UK check scopes
        const authToken = jwt.decode(bearerToken) as { [key: string]: any };
        console.log("auth Token: "+authToken);
    }


    next();
}


// token expiry
