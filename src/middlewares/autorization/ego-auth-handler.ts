import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../error-handler.js';
import jwt from 'jsonwebtoken';
import memoize from 'memoizee';
import axios from 'axios';
import ms from 'ms';
import * as config from '../../config.js';
import {AuthorizationStrategy, extractHeaderToken} from "./auth-util.js";

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

	 verifyEgoToken = async (token: string, egoURL: string) => {
		const key = await this.getKey(config.authServerUrl);
		return jwt.verify(token, key);
	};

	 async  authHandler(req: Request, res: Response, next: NextFunction) {
		//UK: check api-key or jwt

		console.log('ego auth handler');

		 const bearerToken = extractHeaderToken(req);

		let valid = false;
		try {
			valid = !!(bearerToken && (await this.verifyEgoToken(bearerToken, 'egoURL')));
		} catch (e) {
			console.error(e);
			valid = false;
		}

		if (!valid) {
			res.statusCode = 401;
			//next(new UnauthorizedError('You need to be authenticated for this request.'));
			throw new UnauthorizedError('You need to be authenticated for this request.');
		} else {
			const authToken = jwt.decode(bearerToken) as { [key: string]: any };
			//console.log('auth Token: ' + authToken.toString());
			const tokenScopes = authToken['context']['scope'];

			config.scopes.forEach((scope) => {
				if (!tokenScopes.includes(scope)) {
					res.statusCode = 403;
					//next(new ForbiddenError('Forbidden. Permission Denied'));
					throw new ForbiddenError('Forbidden. Permission Denied');
				}
			});
		}

		// next();
	 }
}

export default new EgoAuthStrategy();





/*const getKey = memoize(
	async (egoURL: string) => {
		const response = await axios.get(egoURL);
		return response.data;
	},
	{
		maxAge: ms('1h'),
		preFetch: true,
	},
);

const verifyEgoToken = async (token: string, egoURL: string) => {
	const key = await getKey(egoUrl);
	//const key = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtPZ5ZeRS2744CMCHohZBbwEAgF0qu4BjAchNxWfSuyCCsa4LeyjkF/JOKqiOP522ULFlzEirfmntGYluxKNDr40JIMPBx6qnASZvT83mY9kbMkqeTuZ2nrRf9Z2o4aTBEyjWbKY2plWGML9WGUzOBUqMXxDc4/8FGFXzOZdmn2RItfD+hQM6F8RHWTE6P9+h4S/oPhqZ+4Ih3Jrk6BPG0Fv1u+9Dd7f7lptDaXALCEkuMqfwEwcpSUppkmErgGJ5Ujg3rtcbdFwgcr+cVaUkmZmSXn60JG0usiAO/d19DHa8CzETGlU4vaEvDm43h9ZpAOMIkoz8gos9IqYuBsYylQIDAQAB'
	return jwt.verify(token, key);
};

export async function egoAuthHandler(req: Request, res: Response, next: NextFunction) {
	//UK: check api-key or jwt

	console.log('ego auth handler');
	const { authorization: authorizationHeader } = req.headers;
	const { authorization: authorizationBody } = req.body || {};

	const authorization = authorizationHeader || authorizationBody;
	const bearerToken: string = authorization ? authorization.split(' ')[1] : req.query.key;

	let valid = false;
	try {
		valid = !!(bearerToken && (await verifyEgoToken(bearerToken, 'egoURL')));
	} catch (e) {
		console.error(e);
		valid = false;
	}

	if (!valid) {
		res.statusCode = 401;
		next(new UnauthorizedError('You need to be authenticated for this request.'));
	} else {
		const authToken = jwt.decode(bearerToken) as { [key: string]: any };
		//console.log('auth Token: ' + authToken.toString());
		const scopes = authToken['context']['scope'];

		config.scopes.forEach((scope) => {
			if (!scopes.includes(scope)) {
				res.statusCode = 403;
				next(new ForbiddenError('Forbidden. Permission Denied'));
			}
		});
	}

	next();
}*/




//UK: check memoize and axios
