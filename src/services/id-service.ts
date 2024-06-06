import { InvalidEntityError, InvalidSearchValueError } from '../middlewares/error-handler.js';
import { getTableDefinition, prepareDataSource } from '../middlewares/datasource.js';
import { Mutex } from 'async-mutex';
import * as config from '../config.js';
import { RecordType } from 'zod';

const mutex = new Mutex();

// create new id
async function createId(searchCriteria: {}, entityType: string, requestId: number) {
	console.log(`******** CREATE CALLED :${requestId}`);
	const repo = await prepareDataSource(getTableDefinition(entityType), requestId, config.dbSync);
	const savedEntity = await repo.save(searchCriteria);
	return savedEntity;
}

// check if an argo id exists for the submitter and program
async function findId(searchCriteria: {}, entityType: string, requestId: number) {
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
	return entity;
}

export async function getId(searchTerms: Record<string, string>, requestId: number) {
	const release = await mutex.acquire();
	try {
		const entityType = searchTerms.entityType;
		validateEntityType(entityType);
		const keyCriteria = getSearchCriteria(entityType, searchTerms);
		validateSearchParams(keyCriteria);
		let id = await findId(keyCriteria, entityType, requestId);

		if (!id) {
			id = await createId(keyCriteria, entityType, requestId);
		}
		return id;
	} finally {
		release();
	}
}

export async function findIdFor(searchTerms: Record<string, string>, requestId: number) {
	const entityType = searchTerms.entityType;
	validateEntityType(entityType);
	const keyCriteria = getSearchCriteria(entityType, searchTerms);
	validateSearchParams(keyCriteria);
	return (await findId(keyCriteria, entityType, requestId)) || 'Id not found for this search criteria';
}

function validateEntityType(entityType: string) {
	if (!Object.values(config.entityList).includes(entityType)) {
		throw new InvalidEntityError('Invalid entity type: ' + entityType, 400);
	}
}

function validateSearchParams(searchCriteria: RecordType<string, string>) {
	var format = /[\^°<>#,*~!"§$%?®©¶\s]+/;
	const keys = Object.keys(searchCriteria) as (keyof typeof searchCriteria)[];
	for (let i = 0; i <= keys.length - 1; i++) {
		const searchString = searchCriteria[keys[i]];
		if (format.test(searchString) || searchString.length < 1) {
			throw new InvalidSearchValueError("Invalid value '" + searchString + "' for " + keys[i], 400);
		}
	}
}

function getSearchCriteria(entity: string, requestParams: Record<string, string>) {
	const property = `${entity.toUpperCase()}_SEARCH`;
	const search = config.searchCriterias.get(entity);
	const keyCriteria = {...search};
	for (const param in requestParams) {
		if (keyCriteria.hasOwnProperty(param)) {
			keyCriteria[param] = requestParams[param];
		}
	}
	return keyCriteria;
}
