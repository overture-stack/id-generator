import { NextFunction, Request, Response } from 'express';

export function defaultErrorHandler(err: IdGenerationError, req: Request, res: Response, next: NextFunction) {
	if (res.headersSent) {
		console.log('headers sent');
		return next(err);
	}
	res.json({
		status: err.name,
		message: err.message,
		code: err.statusCode,
	});
}

export class IdGenerationError extends Error {
	statusCode: Number;
	constructor(message: string, statusCode: Number) {
		super(message);
		this.name = 'IdGenerationError';
		this.statusCode = statusCode;
	}
}

export class InvalidSearchValueError extends IdGenerationError {
	constructor(message: string, statusCode: Number) {
		super(message, statusCode);
		this.name = 'InvalidSearchValueError';
		this.statusCode = statusCode;
	}
}

export class InvalidEntityError extends IdGenerationError {
	constructor(message: string, statusCode: Number) {
		super(message, statusCode);
		this.name = 'InvalidEntityError';
		this.statusCode = statusCode;
	}
}

export class UnauthorizedError extends IdGenerationError {
	constructor(message: string, statusCode: Number) {
		super(message, statusCode);
		this.name = 'UnauthorizedError';
		this.statusCode = statusCode;
	}
}

export class ForbiddenError extends IdGenerationError {
	constructor(message: string, statusCode: Number) {
		super(message, statusCode);
		this.name = 'ForbiddenError';
		this.statusCode = statusCode;
	}
}

export class NetworkError extends IdGenerationError {
	constructor(message: string, statusCode: Number) {
		super(message, statusCode);
		this.name = 'NetworkError';
		this.statusCode = statusCode;
	}
}
