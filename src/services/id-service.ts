import { NextFunction, Request, response, Response } from 'express';
import { InvalidEntityError, InvalidRequestError } from '../middlewares/error-handler.js';
import { closeDBConnection, getTableDefinition, prepareDataSource } from '../middlewares/datasource.js';
import { Mutex } from 'async-mutex';
import * as config from '../config.js';
import { date, RecordType } from 'zod';
import { getRecord } from '../config-validator.js';

const mutex = new Mutex();

// create new id
async function createId(searchCriteria: {}, entityType: string, next: NextFunction, requestId: number) {
	console.log('******** CREATE CALLED :' + requestId);
	const repo = await prepareDataSource(getTableDefinition(entityType), requestId, config.dbSync);

	const savedEntity = await repo.save(searchCriteria);
	await closeDBConnection(next, requestId).then(() => console.log('DB connection closed'));
	return savedEntity;
}

// check if an argo id exists for the submitter and program
async function findId(searchCriteria: {}, entityType: string, next: NextFunction, requestId: number) {
	console.log('******** FIND CALLED :' + requestId);
	const schemaInfo = getTableDefinition(entityType);
	const repo = await prepareDataSource(schemaInfo, requestId, config.dbSync);

	const keys = Object.keys(searchCriteria) as (keyof typeof searchCriteria)[];

	let query = repo
		.createQueryBuilder(schemaInfo.tablename)
		.where(schemaInfo.tablename + '.' + keys[0] + '= :' + keys[0], { [keys[0]]: searchCriteria[keys[0]] });

	if (keys.length > 1) {
		for (let i = 1; i <= keys.length - 1; i++) {
			query = query.andWhere(schemaInfo.tablename + '.' + keys[i] + '= :' + keys[i], {
				[keys[i]]: searchCriteria[keys[i]],
			});
		}
	}

	const entity = await query.addSelect([schemaInfo.tablename + '.entityId']).getOne();
	await closeDBConnection(next, requestId).then(() => console.log('DB connection closed'));
	return entity;
}

export async function getId(request: Request, response: Response, next: NextFunction, requestId: number) {
	const release = await mutex.acquire();
	try {
		const entityType = request.params.entityType;
		validateEntityType(entityType, next);
		const keyCriteria = getSearchCriteria(entityType, request);
		validateSearchParams(keyCriteria, next);
		let id = await findId(keyCriteria, entityType, next, requestId);

		if (!id) {
			id = await createId(keyCriteria, entityType, next, requestId);
		}
		return id;
	} finally {
		release();
	}
}

export async function findIdFor(request: Request, response: Response, next: NextFunction, requestId: number) {
	const entityType = request.params.entityType;
	validateEntityType(entityType, next);
	const keyCriteria = getSearchCriteria(entityType, request);
	validateSearchParams(keyCriteria, next);
	return (await findId(keyCriteria, entityType, next, requestId)) || 'Id not found for this search criteria';
}

function validateEntityType(entityType: string, next: NextFunction) {
	if (!Object.values(config.entityList).includes(entityType)) {
		response.status(400);
		throw new InvalidEntityError('Invalid entity type: ' + entityType);
	}
}

function validateSearchParams(searchCriteria: RecordType<string, string>, next: NextFunction) {
	var format = /[\^°<>#,*~!"§$%?®©¶\s]+/;
	const keys = Object.keys(searchCriteria) as (keyof typeof searchCriteria)[];
	for (let i = 0; i <= keys.length - 1; i++) {
		const searchString = searchCriteria[keys[i]];
		if (format.test(searchString) || searchString.length < 1) {
			response.status(400);
			throw new InvalidRequestError("Invalid value '" + searchString + "' for " + keys[i])
		}
	}
}

function getSearchCriteria(entity: string, request: Request) {
	const property = entity.toUpperCase() + `_SEARCH`;
	const requestParams = { ...request.params };
	const keyCriteria = getRecord(property).parse(JSON.parse(process.env[property] || '[]'));
	for (const param in requestParams) {
		if (keyCriteria.hasOwnProperty(param)) {
			keyCriteria[param] = requestParams[param];
		}
	}
	return keyCriteria;
}
