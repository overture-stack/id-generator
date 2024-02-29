import { NextFunction, Request, Response } from 'express';

export function defaultErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
	// UK check err

	if (res.headersSent) {
		return next(err);
	}
	res.status(500).json({
		status: 'error',
		message: 'Error while getting id for entity type: ' + req.params.entityType + ' -- ' + err,
	});
}

export class IdGenerationError extends Error {
	constructor(message: string) {
		super(message);
	}
}
