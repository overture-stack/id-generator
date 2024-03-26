import { NextFunction, Request, Response } from 'express';
import { Issuer } from 'openid-client';
import * as config from '../../config.js';
import { ForbiddenError, UnauthorizedError } from '../error-handler.js';
import { AuthorizationStrategy, extractHeaderToken, isJwt } from './auth-util.js';
import axios from 'axios';

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

class KeycloakAuth implements AuthorizationStrategy {
	async authHandler(req: Request, res: Response, next: NextFunction) {
		console.log('keycloak auth handler');
		const token = extractHeaderToken(req);
		try {
			if (!(await this.hasPermissions(token))) {
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

	async handleApiKey(apiKey: string) {
		const basicAuth = Buffer.from(config.clientId + ':' + config.clientSecret, 'binary').toString('base64');
		const headers = {
			headers: {
				'Content-Type': 'multipart/form-data',
				Authorization: 'Basic ' + basicAuth,
			},
		};
		const data = new FormData();
		data.append('apiKey', apiKey);
		const response = await axios.post(config.authServerUrl + '/apikey/check_api_key/', data, headers);
		if (response.data.revoked && !response.data.valid) {
			console.log('token invalid or revoked');
			return false;
		}
		const scopesChecker = config.scopes.every((sc) => {
			console.log('sc: ' + sc);
			return response.data.scope.includes(sc);
		});
		if (!scopesChecker) {
			console.log('scopes absent');
			return false;
		}
		console.log('response: ' + response.data.scope[0]);
		return true;
	}

	async handleJwt(token: string) {
		const client = await this.getClient();
		const permissionTokenJson: TokenIntrospectionResponse = await client.introspect(token);
		if (!permissionTokenJson.active) {
			console.log('Token inactive');
			return false;
		}
		if (!permissionTokenJson.aud?.toString().includes(config.clientId)) {
			console.log('Invalid aud');
			return false;
		}
		const tokenPermissions: Permissions[] = permissionTokenJson.authorization['permissions'];
		const scopesChecker = config.scopes.every((sc) => {
			return (
				tokenPermissions.filter((p: Permissions) => {
					return p.rsname.includes(sc.split('.')[0]) && p.scopes?.includes(sc.split('.')[1]);
				}).length > 0
			);
		});
		if (!scopesChecker) {
			console.log('invalid scopes');
			return false;
		}
		console.log('permissions present');
		return true;
	}

	async getClient() {
		const issuer = await Issuer.discover(config.authServerUrl + '/.well-known/openid-configuration');
		const client = new issuer.Client({
			client_id: config.clientId,
			client_secret: config.clientSecret,
			scope: 'openid',
		});
		return client;
	}
}

export default new KeycloakAuth();

// UK
// api result caching (alternative to memoize)
// refactor code and make it better
// check for unauth error in KC for invalid or inactive tokens

