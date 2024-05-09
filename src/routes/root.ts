import { NextFunction, Request, Response } from 'express';
import { findIdFor, getId } from '../services/id-service.js';

export function root(request: Request, response: Response) {
	const healthcheck = {
		message: 'Service Up',
		timestamp: Date.now(),
	};
	return response.send(healthcheck);
}

export function getIdForEntity(request: Request, response: Response, next: NextFunction) {
	const requestId = Date.now();
	console.log(requestId);
	return getId({ ...request.params }, requestId)
		.then((id) => response.status(200).json(id))
		.catch((err) => {
			//closeDBConnection(next, requestId).then(() => console.log('DB conn closed'));
			next(err);
		});
}

export function findIdForEntity(request: Request, response: Response, next: NextFunction) {
	const requestId = Date.now();
	console.log(requestId);
	return findIdFor({ ...request.params }, requestId)
		.then((id) => response.status(200).json(id))
		.catch((err) => {
			//closeDBConnection(next, requestId).then(() => console.log('DB conn closed'));
			next(err);
		});
}
