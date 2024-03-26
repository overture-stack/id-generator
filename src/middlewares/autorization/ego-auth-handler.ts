import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../error-handler.js';
import jwt from 'jsonwebtoken';
import memoize from 'memoizee';
import axios from 'axios';
import ms from 'ms';
import * as config from '../../config.js';
import { AuthorizationStrategy, extractHeaderToken, isJwt } from './auth-util.js';

/*interface ApiKeyJson {
    user_id: string;
    exp: string;
    scope: string[]
}*/

class EgoAuthStrategy implements AuthorizationStrategy {
	getKey = memoize(
		async (egoURL: string) => {
			const response = await axios.get(egoURL);
			return response.data;
		},
		{
			maxAge: ms('1h'),
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
		const response = await axios.post(config.authServerUrl + '/o/check_api_key?apiKey=' + token, null, headers);
		return response.data;
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
				res.statusCode = 403;
				throw new ForbiddenError('Forbidden. Permission Denied');
			}
		} catch (e) {
			if (e instanceof ForbiddenError) {
				res.statusCode = 403;
				throw e;
			} else {
				console.log(e);
				res.statusCode = 401;
				throw new UnauthorizedError('You need to be authenticated for this request.');
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
			throw new Error();
		} else {
			const authToken = jwt.decode(bearerToken) as { [key: string]: any };
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

export default new EgoAuthStrategy();

// UK: check memoize and axios
