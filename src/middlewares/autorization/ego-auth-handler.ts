import { NextFunction, Request, Response } from 'express';
import {ForbiddenError, NetworkError, UnauthorizedError} from '../error-handler.js';
import jwt from 'jsonwebtoken';
import memoize from 'memoizee';
import axios from 'axios';
import ms from 'ms';
import * as config from '../../config.js';
import { extractHeaderToken, isJwt } from './auth-util.js';
import {AuthorizationStrategy} from "./auth-types.js";

class EgoAuth implements AuthorizationStrategy {
	getKey = memoize(
		async (egoURL: string) => {
			try {
				const response = await axios.get(egoURL);
				return response.data;
			}catch(e){
				console.log(e);
				throw new NetworkError(`EGO connection failure. Caused by: ${e.message}`, 500);
			}
		},
		{
			maxAge: ms(config.publicKeyCache),
			preFetch: true,
		},
	);

	scopeChecker = (tokenScopes: string[]) => {
		return config.scopes.every((sc) => {
			return tokenScopes.includes(sc);
		});
	};

	verifyApiKey = async (token: string) => {
		const basicAuth = Buffer.from(config.clientId + ':' + config.clientSecret, 'binary').toString('base64');
		const headers = {
			headers: {
				Authorization: 'Basic ' + basicAuth,
			},
		};
		try{
			const response = await axios.post(config.authServerUrl + '/o/check_api_key?apiKey=' + token, null, headers);
			return response.data;
		}catch(e){
			console.log(e);
			throw new NetworkError('EGO connection failure', 500);
		}
	};

	verifyEgoToken = async (token: string) => {
		const key = await this.getKey(config.authServerUrl + '/oauth/token/public_key');
		return jwt.verify(token, key);
	};

	async authHandler(req: Request, res: Response, next: NextFunction) {
		console.log('ego auth handler');
		const bearerToken = extractHeaderToken(req);
		try {
			if (!(await this.hasPermissions(bearerToken))) {
				throw new ForbiddenError('Forbidden. Permission Denied', 403);
			}
		} catch (e) {
			if (e instanceof ForbiddenError || e instanceof NetworkError) {
				throw e;
			} else {
				console.log(e);
				throw new UnauthorizedError(e.message, 401);
			}
		}
	}

	async hasPermissions(token: string) {
		if (isJwt(token)) {
			return this.handleJwt(token);
		} else {
			return this.handleApiKey(token);
		}
	}


	async handleJwt(bearerToken: string) {
		let valid = false;
		valid = !!(bearerToken && (await this.verifyEgoToken(bearerToken)));
		if (!valid) {
			console.log('Token not valid');
			throw new UnauthorizedError('Invalid token', 401);
		} else {
			const authToken = jwt.decode(bearerToken);
			if (!authToken || typeof authToken === "string") {
				console.log('Error decoding token');
				throw new UnauthorizedError('Error decoding token', 401);
			}
			const tokenScopes = authToken['context']['scope'];
			if (!this.scopeChecker(tokenScopes)) {
				console.log('Invalid scopes');
				return false;
			}
			return true;
		}
	}


	async handleApiKey(token: string) {
		const tokenJson = await this.verifyApiKey(token);
		if (!this.scopeChecker(tokenJson['scope'])) {
			console.log('Invalid scopes');
			return false;
		}
		return true;
	}
}

export default new EgoAuth();
