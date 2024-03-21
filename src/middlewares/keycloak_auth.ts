import {NextFunction, Request, Response} from "express";
import {Issuer} from "openid-client";
import {clientId, clientSecret, keycloakResource, keycloakUrl} from "../config.js";
import {ForbiddenError} from "./error-handler.js";
import {isJwt} from "./auth.js";


interface Permissions {
    scopes: string[],
    rsid: string,
    rsname: string
}

interface TokenIntrospectionResponse{
    active: boolean;
    client_id?: string;
    exp?: number;
    iat?: number;
    sid?: string;
    iss?: string;
    jti?: string;
    username?: string;
    aud?: string | string[];
    scope: string;
    sub?: string;
    nbf?: number;
    token_type?: string;
    cnf?: {
        'x5t#S256'?: string;
        [key: string]: any;
    };
    [key: string]: any;
}

const issuer = await Issuer.discover(keycloakUrl);
const client = new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'openid'
});


export async function keycloakAuthHandler(req: Request, res: Response, next: NextFunction) {
    console.log('keycloak auth handler');
    const { authorization: authorizationHeader } = req.headers;
    const { authorization: authorizationBody } = req.body || {};

    const authorization = authorizationHeader || authorizationBody;
    const token: string = authorization ? authorization.split(' ')[1] : req.query.key;
    if(isJwt(token)){
        if(!await hasPermissions(token)){
            res.statusCode = 403;
            next(new ForbiddenError('Forbidden. Permission Denied'));
        };
        next();
    }
}


export async function handleApiKey(){

}

export async function hasPermissions(token: string){
    const permissionTokenJson: TokenIntrospectionResponse = await client.introspect(token);
    if(!permissionTokenJson.active){
        console.log("Token inactive");
        return false;
    }
    if(!permissionTokenJson.aud?.toString().includes(clientId)){
        console.log("Invalid aud");
        return false;
    }
    const permissions: Permissions[] = permissionTokenJson.authorization['permissions'];
    if (permissions.filter((p: Permissions) => {
        return p.rsname.includes(keycloakResource) && p.scopes?.includes('WRITE');
    }).length > 0) {
        console.log("permissions present");
        return true;
    }
    console.log("permissions absent");
    return false;
}


// UK
// check intrspect api error.
