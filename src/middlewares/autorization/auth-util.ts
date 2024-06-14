import { NextFunction, Request, Response } from 'express';
import {authStrategy, securedApi} from '../../config.js';
import egoAuth from './ego-auth-handler.js';
import keycloakAuth from './keycloak-auth-handler.js';
import { ForbiddenError, UnauthorizedError } from '../error-handler';

function getAuthStrategy() {
	if (authStrategy === 'EGO') {
		return egoAuth;
	} else if (authStrategy === 'KEYCLOAK') {
		return keycloakAuth;
	}
}

export function authorize(action: string){
	return async (req: Request, res: Response, next: NextFunction) => {
		console.log('authorize called');
		try {
			if(securedApi.length == 0 || securedApi.includes(action)) await getAuthStrategy()?.authHandler(req, res, next);
		} catch (err) {
			next(err);
		}
		next();
	}
}

export function extractHeaderToken(req: Request) {
	const authorization = req.headers.authorization||'';
	const token: string = authorization.split(' ')[1];
	return token;
}

export function isJwt(tokenString: string) {
	if (!tokenString) {
		console.log('Token missing');
		throw new Error('Token missing');
	}
	const jwtSplitted = tokenString.split('.');
	if (jwtSplitted.length != 3) {
		return false;
	}
	const jwtHeader = Buffer.from(jwtSplitted[0], 'base64').toString('binary');
	if (!jwtHeader.includes('alg') && !JSON.parse(jwtHeader)['typ'].includes('JWT')) {
		return false;
	}
	return true;
}
