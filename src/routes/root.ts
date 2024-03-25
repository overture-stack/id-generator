import { NextFunction, Request, Response } from 'express';
import { findIdFor, getId } from '../services/id-service.js';
import { closeDBConnection } from '../middlewares/datasource.js';
import {authorize} from "../middlewares/autorization/auth-util.js";
/*import {code_verifier, newClient} from "../server.js";


export async function authUtil(request: Request, response: Response) {
	console.log("health check");

	const params = newClient.callbackParams(request);
	const tokenSet = await newClient.callback('https://client.example.com/callback', params, { code_verifier });
	console.log('received and validated tokens %j', tokenSet);
	console.log('validated ID Token claims %j', tokenSet.claims());

	//response.status(200).send("it's ok");
}*/


class ServiceRouter {

	root(request: Request, response: Response) {
		const healthcheck = {
			message: 'Service Up',
			timestamp: Date.now(),
		};
		response.send(healthcheck);
	}

	@authorize('CREATE')
	getIdForEntity(request: Request, response: Response, next: NextFunction) {
		const requestId = Date.now();
		console.log(requestId);
		return getId(request, response, next, requestId)
			.then((id) => response.status(200).json(id))
			.catch((err) => {
				closeDBConnection(next, requestId).then(() => console.log('DB conn closed'));
				next(err);
			});
	}

	@authorize('FIND')
	findIdForEntity(request: Request, response: Response, next: NextFunction) {
		const requestId = Date.now();
		console.log(requestId);
		return findIdFor(request, response, next, requestId)
			.then((id) => response.status(200).json(id))
			.catch((err) => {
				closeDBConnection(next, requestId).then(() => console.log('DB conn closed'));
				next(err);
			});
	}
}

export default new ServiceRouter();

