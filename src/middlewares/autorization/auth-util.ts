import { NextFunction, Request, Response } from 'express';
import {authStrategy, securedApi} from '../../config.js';
import egoAuth from './ego-auth-handler.js';
import keycloakAuth from './keycloak-auth-handler.js';
import { ForbiddenError, UnauthorizedError } from '../error-handler';

export interface AuthorizationStrategy {
	authHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
}

function getAuthStrategy() {
	if (authStrategy === 'EGO') {
		return egoAuth;
	} else if (authStrategy === 'KEYCLOAK') {
		return keycloakAuth;
	}
}

export function authorize(action: string): MethodDecorator {
	console.log('authorize called');
	return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
		const origFunction = descriptor.value;
		descriptor.value = async function (...args: any[]) {
			const request = arguments[0] as Request;
			const response = arguments[1] as Response;
			const next = arguments[2] as NextFunction;
			try {
				if(securedApi.length == 0 || securedApi.includes(action)) await getAuthStrategy()?.authHandler(request, response, next);
				origFunction.apply(this, args);
			} catch (err) {
				next(err);
			}
		};
	};
}

export function extractHeaderToken(req: Request) {
	const authorization = req.headers.authorization||'';
	const token: string = authorization.split(' ')[1];
	return token;
}

export function isJwt(tokenString: string) {
	if (!tokenString) {
		console.log('Token missing');
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
