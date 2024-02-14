import {NextFunction, Request, Response} from "express"
import {IdGenerationError} from "../middlewares/error-handler";
import {
    closeDBConnection, getTableDefinition,
    prepareDataSource
} from "../middlewares/datasource";
import {Mutex} from "async-mutex";

const mutex = new Mutex();
let id: {entityId: string} = {entityId: ""};


// create new id
async function createId(searchCriteria: {}, entityType: string, next: NextFunction, requestId: number){
    console.log("******** CREATE CALLED :"+ requestId)
    const repo = await prepareDataSource(getTableDefinition(entityType), requestId);

    id.entityId = evaluateExpression(entityType);
    searchCriteria = {...searchCriteria, ...id};

    const savedEntity = await repo.save(searchCriteria);
    await closeDBConnection(next, requestId).then(() => console.log("DB connection closed"))
    return savedEntity;
}


// check if an argo id exists for the submitter and program
async function findId(searchCriteria: {}, entityType: string, next: NextFunction, requestId: number){
    console.log("******** FIND CALLED :"+ requestId)
    const  schemaInfo = getTableDefinition(entityType);
    const repo = await prepareDataSource(schemaInfo, requestId);
    let query = repo
        .createQueryBuilder(schemaInfo.tablename)
        .where(schemaInfo.tablename+"."+Object.keys(searchCriteria)[0]+ "= :"+Object.keys(searchCriteria)[0], {[Object.keys(searchCriteria)[0]]: searchCriteria[Object.keys(searchCriteria)[0]]})

    if (Object.keys(searchCriteria).length>1){
        for(let i = 1; i<=Object.keys(searchCriteria).length-1; i++){
            query = query.andWhere(schemaInfo.tablename+"."+Object.keys(searchCriteria)[i]+ "= :"+Object.keys(searchCriteria)[i], {[Object.keys(searchCriteria)[i]]: searchCriteria[Object.keys(searchCriteria)[i]]})
        }
    }
    const entity = await query.addSelect([schemaInfo.tablename+".entityId"]).getOne();
    await closeDBConnection(next, requestId).then(() => console.log("DB connection closed"))
    return entity;
}


export async function getId(request: Request, response: Response, next: NextFunction, requestId: number){
    const release = await mutex.acquire();
    try {
        const entityType = request.params.entityType;
        let keyCriteria = getSearchCriteria(entityType);
        keyCriteria = {...request.params};

        if (!Object.values(JSON.parse(process.env["ENTITY_LIST"])).includes(entityType)) {
            next(new IdGenerationError("invalid entity type"));
        }

        let id = await findId(keyCriteria, entityType, next, requestId);
        if (!id) {
            id = await createId(keyCriteria, entityType, next, requestId);
        }
        return id;
    }finally {
        release();
    }
}


function getSearchCriteria(entity: string){
    return process.env[entity.toUpperCase()] as {};
}


function evaluateExpression(entity: string): string {
    const exp = process.env[entity.toUpperCase()+`_ID_EXPRESSION`];
    const fn = new Function(exp);
    return fn();
}

//to check
// change name of argo id column and test if search criteria still works and custom generated id is saved
// remove sequences from env and restart