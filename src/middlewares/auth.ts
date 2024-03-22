
import { NextFunction, Request, Response } from 'express';
import {UnauthorizedError} from "./error-handler";

/// ego-KC switch
export async function egoAuthHandler() {}



export function extractHeaderToken(req: Request){
	const { authorization: authorizationHeader } = req.headers;
	const { authorization: authorizationBody } = req.body || {};

	const authorization = authorizationHeader || authorizationBody;
	const token: string = authorization ? authorization.split(' ')[1] : req.query.key;
	return token;
}

export function isJwt(tokenString: string) {
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
