import { NextFunction, Request, Response } from 'express';

export function defaultErrorHandler(err: IdGenerationError, req: Request, res: Response, next: NextFunction) {
	if (res.headersSent) {
		return next(err);
	}

	res.json({
		status: err.name,
		message: err.message,
		code: err.statusCode, //res.statusCode,
	});
}

export class IdGenerationError extends Error {
	statusCode: Number;
	constructor(message: string, statusCode: Number) {
		super(message);
		this.name = 'IdGenerationError';
		this.statusCode = statusCode
	}
}

export class InvalidRequestError extends IdGenerationError {
	constructor(message: string, statusCode: Number) {
		super(message, statusCode);
		this.name = 'InvalidRequestError';
		this.statusCode = statusCode
	}
}

export class InvalidEntityError extends IdGenerationError {
	constructor(message: string, statusCode: Number) {
		super(message, statusCode);
		this.name = 'InvalidEntityError';
		this.statusCode = statusCode
	}
}

export class UnauthorizedError extends IdGenerationError {
	constructor(message: string, statusCode: Number) {
		super(message, statusCode);
		this.name = 'UnauthorizedError';
		this.statusCode = statusCode
	}
}

export class ForbiddenError extends IdGenerationError {
	constructor(message: string, statusCode: Number) {
		super(message, statusCode);
		this.name = 'ForbiddenError';
		this.statusCode = statusCode
	}
}
