import { NextFunction, Request, Response } from 'express';
import { Issuer } from 'openid-client';
import * as config from '../../config.js';
import {ForbiddenError, NetworkError, UnauthorizedError} from '../error-handler.js';
import { extractHeaderToken, isJwt } from './auth-util.js';
import {AuthorizationStrategy} from "./auth-types.js";
import {RecordType, z} from "zod";
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
				throw new ForbiddenError('Forbidden. Permission Denied', 403);
			}
		} catch (e) {
			if (e instanceof ForbiddenError || e instanceof NetworkError) {
				throw e;
			} else {
				console.log(e);
				throw new UnauthorizedError(`Could not authenticate: ${e}`, 401);
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
		/*const basicAuth = Buffer.from(config.clientId + ':' + config.clientSecret, 'binary').toString('base64');
		const headers = {
			headers: {
				'Content-Type': 'multipart/form-data',
				Authorization: 'Basic ' + basicAuth,
			},
		};
		const data = new FormData();
		data.append('apiKey', apiKey);
		const response = await axios.post(config.authServerUrl + '/apikey/check_api_key/', data, headers);*/
		const response = await this.checkApiKey(apiKey);
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
		const permissionTokenJson = await client.introspect(token);
		if (!permissionTokenJson.active) {
			console.log('Token inactive');
			return false;
		}
		if (!permissionTokenJson.aud?.toString().includes(config.clientId)) {
			console.log('Invalid aud');
			return false;
		}
		const tokenPermissions = this.validateIntrospectionResponse(permissionTokenJson);
		const scopesChecker = config.scopes.every((sc) => {
			return (
				tokenPermissions.filter((p) => {
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
		try {
			const issuer = await Issuer.discover(config.authServerUrl + '/.well-known/openid-configuration');
			const client = new issuer.Client({
				client_id: config.clientId,
				client_secret: config.clientSecret,
				scope: 'openid',
			});
			return client;
		}catch(e){
			console.log(e);
			throw new NetworkError('KEYCLOAK connection failure', 500);
		}
	}

	async checkApiKey(apiKey: string){
		try {
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
			return response;
		}catch(e){
			console.log(e);
			throw new NetworkError(`KEYCLOAK connection failure. Caused by: ${e}`, 500);
		}
	}

	 validateIntrospectionResponse(introspectionResponse: any){
		// Expected structure of keycloak permissions from TokenIntrospectionResponse
		const KeycloakPermission = z.object({
			scopes: z.string().array().optional(),
			rsid: z.string(),
			rsname: z.string(),
		});

		type KeycloakPermission = z.infer<typeof KeycloakPermission>;

		const KeycloakIntorspectionAuthorization = z.object({
			permissions: z.array(KeycloakPermission)
		})
		type KeycloakIntorspectionAuthorization = z.infer<typeof KeycloakIntorspectionAuthorization>;

		const authorizationParseResult = KeycloakIntorspectionAuthorization.safeParse(introspectionResponse.authorization);
		if(!authorizationParseResult.success) {
			console.warn(`Introspection auth token does not contain permissions in the expected format. Parsing error:`, authorizationParseResult.error)
		}
		const tokenPermissions = authorizationParseResult.success ? authorizationParseResult.data.permissions : [];
		return tokenPermissions;
	}
}

export default new KeycloakAuth();
