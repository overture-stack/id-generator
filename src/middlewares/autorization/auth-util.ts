import { NextFunction, Request, response, Response } from 'express';
import { config } from 'dotenv';
import { authStrategy } from '../../config.js';
import egoAuthStrategy from './ego-auth-handler.js';
import keycloakAuthStrategy from './keycloak-auth-handler.js';
import { UnauthorizedError } from '../error-handler';

export interface AuthorizationStrategy {
	authHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
}

function getAuthStrategy() {
	if (authStrategy === 'EGO') {
		return egoAuthStrategy;
	} else if (authStrategy === 'KEYCLOAK') {
		return keycloakAuthStrategy;
	}
}

/// ego-KC switch
export function authorize(action: string): MethodDecorator {
	console.log('authorize called');
	return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
		const origFunction = descriptor.value;
		descriptor.value = async function (...args: any[]) {
			const request = arguments[0] as Request;
			const response = arguments[1] as Response;
			const next = arguments[2] as NextFunction;
			try {
				await getAuthStrategy()?.authHandler(request, response, next); // UK check the question
				origFunction.apply(this, args);
			} catch (err) {
				next(err);
			}
		};
	};
}

export function extractHeaderToken(req: Request) {
	const { authorization: authorizationHeader } = req.headers;
	const { authorization: authorizationBody } = req.body || {};
	const authorization = authorizationHeader || authorizationBody;
	const token: string = authorization ? authorization.split(' ')[1] : req.query.key;
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
