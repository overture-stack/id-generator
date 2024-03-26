import { NextFunction, Request, Response } from 'express';

export function defaultErrorHandler(err: IdGenerationError, req: Request, res: Response, next: NextFunction) {
	if (res.headersSent) {
		console.log('headers sent');
		return next(err);
	}

	res.json({
		status: err.name,
		message: err.message,
		code: res.statusCode,
	});
}

export class IdGenerationError extends Error {
	constructor(message: string) {
		super(message);
	}
}

export class InvalidRequestError extends IdGenerationError {
	constructor(message: string) {
		super(message);
		this.name = 'InvalidRequestError';
	}
}

export class InvalidEntityError extends IdGenerationError {
	constructor(message: string) {
		super(message);
		this.name = 'InvalidEntityError';
	}
}

export class UnauthorizedError extends IdGenerationError {
	constructor(message: string) {
		super(message);
		this.name = 'UnauthorizedError';
	}
}

export class ForbiddenError extends IdGenerationError {
	constructor(message: string) {
		super(message);
		this.name = 'ForbiddenError';
	}
}
