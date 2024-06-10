import { NextFunction, Request, Response } from 'express';
import { findIdFor, getId } from '../services/id-service.js';
import { authorize } from '../middlewares/autorization/auth-util.js';


class ServiceRouter {
	root(request: Request, response: Response) {
		const healthcheck = {
			message: 'Service Up',
			timestamp: Date.now(),
		};
		return response.send(healthcheck);
	}

	@authorize('CREATE')
	getIdForEntity(request: Request, response: Response, next: NextFunction) {
		const requestId = Date.now();
		console.log(requestId);
		return getId({...request.params}, requestId)
			.then((id) => response.status(200).json(id))
			.catch((err) => {
				next(err);
			});
	}

	@authorize('FIND')
	findIdForEntity(request: Request, response: Response, next: NextFunction) {
		const requestId = Date.now();
		console.log(requestId);
		return findIdFor({...request.params}, requestId)
			.then((id) => response.status(200).json(id))
			.catch((err) => {
				next(err);
			});
	}
}

export default new ServiceRouter();
