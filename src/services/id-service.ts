import { NextFunction, Request, Response } from 'express';
import { IdGenerationError } from '../middlewares/error-handler';
import { closeDBConnection, getTableDefinition, prepareDataSource } from '../middlewares/datasource';
import { Mutex } from 'async-mutex';
import * as config from '../config';
import { searchCriteria } from '../config';

const mutex = new Mutex();

// create new id
async function createId(searchCriteria: {}, entityType: string, next: NextFunction, requestId: number) {
	console.log('******** CREATE CALLED :' + requestId);
	const repo = await prepareDataSource(getTableDefinition(entityType), requestId);

	const savedEntity = await repo.save(searchCriteria);
	await closeDBConnection(next, requestId).then(() => console.log('DB connection closed'));
	return savedEntity;
}

// check if an argo id exists for the submitter and program
async function findId(searchCriteria: {}, entityType: string, next: NextFunction, requestId: number) {
	console.log('******** FIND CALLED :' + requestId);
	const schemaInfo = getTableDefinition(entityType);
	const repo = await prepareDataSource(schemaInfo, requestId);

	const keys = Object.keys(searchCriteria) as (keyof typeof searchCriteria)[]; //UK check this

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
		const keyCriteria = getSearchCriteria(entityType, request);

		if (!Object.values(config.entityList).includes(entityType)) {
			next(new IdGenerationError('invalid entity type'));
		}

		let id = await findId(keyCriteria, entityType, next, requestId);
		if (!id) {
			id = await createId(keyCriteria, entityType, next, requestId);
		}
		return id;
	} finally {
		release();
	}
}

function getSearchCriteria(entity: string, request: Request) {
	const requestParams = { ...request.params };

	const keyCriteria = searchCriteria.parse(JSON.parse(process.env[entity.toUpperCase() + `_SEARCH`] || '[]'));
	for (const param in requestParams) {
		if (keyCriteria.hasOwnProperty(param)) {
			keyCriteria[param] = requestParams[param];
		}
	}

	return keyCriteria;
}
