import { NextFunction, Request, Response } from 'express';
import { Issuer } from 'openid-client';
import { clientId, clientSecret, keycloakResource, keycloakUrl } from '../config.js';
import {ForbiddenError, UnauthorizedError} from './error-handler.js';
import {extractHeaderToken, isJwt} from './auth.js';
import memoize from 'memoizee';
import axios from 'axios';
import ms from 'ms';

interface Permissions {
	scopes: string[];
	rsid: string;
	rsname: string;
}

interface TokenIntrospectionResponse {
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

const issuer = await Issuer.discover(keycloakUrl + '/.well-known/openid-configuration');
const client = new issuer.Client({
	client_id: clientId,
	client_secret: clientSecret,
	scope: 'openid',
});

export async function keycloakAuthHandler(req: Request, res: Response, next: NextFunction) {
	console.log('keycloak auth handler');
	const {authorization: authorizationHeader} = req.headers;
	const {authorization: authorizationBody} = req.body || {};

	const authorization = authorizationHeader || authorizationBody;
	const token: string = authorization ? authorization.split(' ')[1] : req.query.key;
	//const token = extractHeaderToken(req);
	try {
		if (!(await hasPermissions(token))) {
			res.statusCode = 403;
			next(new ForbiddenError('Forbidden. Permission Denied'));
		}
	} catch (e) {
		console.log(e);
		res.statusCode = 401;
		next(new UnauthorizedError('You need to be authenticated for this request.'));
	}
	next();
}

async function hasPermissions(token: string) {
		if (isJwt(token)) {
			return handleJwt(token);
		} else {
			return handleApiKey(token);
		}
}

async function handleApiKey(apiKey: string) {
	const basicAuth = Buffer.from(clientId + ':' + clientSecret, 'binary').toString('base64');
	const headers = {
		headers: {
			'Content-Type': 'multipart/form-data',
			Authorization: 'Basic ' + basicAuth,
		},
	};
	const data = new FormData();
	data.append('apiKey', apiKey);
	const response = await axios.post(keycloakUrl + '/apikey/check_api_key/', data, headers);

	if (response.data.revoked && !response.data.valid) {
		console.log('token invalid or revoked');
		return false;
	}
	if (!response.data.scope.includes(keycloakResource)) {
		console.log('scopes absent');
		return false;
	}
	console.log('response: ' + response.data.scope[0]);
	return true;
}

async function handleJwt(token: string) {
	const permissionTokenJson: TokenIntrospectionResponse = await client.introspect(token);
	if (!permissionTokenJson.active) {
		console.log('Token inactive');
		return false;
	}
	if (!permissionTokenJson.aud?.toString().includes(clientId)) {
		console.log('Invalid aud');
		return false;
	}
	const permissions: Permissions[] = permissionTokenJson.authorization['permissions'];
	if (
		!(
			permissions.filter((p: Permissions) => {
				return p.rsname.includes(keycloakResource.split('.')[0]) && p.scopes?.includes(keycloakResource.split('.')[1]);
			}).length > 0
		)
	) {
		console.log('permissions absent');
		return false;
	}
	console.log('permissions present');
	return true;
}

/*export function isJwt(tokenString: string) {
    const jwtSplitted = tokenString.split('.');
    if (jwtSplitted.length != 3) {
        return false;
    }
    const jwtHeader = Buffer.from(jwtSplitted[0], 'base64').toString('binary');
    if (!jwtHeader.includes('alg') && !JSON.parse(jwtHeader)['typ'].includes('JWT')) {
        return false;
    }
    return true;
}*/

// UK
// check introspect and check-apikey api error.
// check absence of token
// api result caching (alternative to memoize)
// check where to add unauthenticated error
// refactor code and make it better
// check if .env scope for KC is a list
// add keycloack scopes validation
// check if ego and keycloak scopes can be combined -- yes they can. Only one is going to be used at a time anyway
