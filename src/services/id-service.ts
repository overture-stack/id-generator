import {NextFunction, Request, Response} from "express"
import {IdGenerationError} from "../middlewares/error-handler";
import {
    closeDBConnection,
    prepareDataSource,
    SchemaInfo
} from "../middlewares/datasource";
import {Mutex} from "async-mutex";

const mutex = new Mutex();

// create new id
async function createId(searchCriteria: {}, entityType: string, next: NextFunction, requestId: number){
    console.log("******** CREATE CALLED :"+ requestId)
    const repo = await prepareDataSource(getSchemaInfo(entityType), requestId);
    const savedEntity = await repo.save(searchCriteria);
    await closeDBConnection(next, requestId).then(() => console.log("DB connection closed"))
    return savedEntity;//.argoId;
}

// check if an argo id exists for the submitter and program
async function findId(searchCriteria: {}, entityType: string, next: NextFunction, requestId: number){
    console.log("******** FIND CALLED :"+ requestId)
    const  schemaInfo = getSchemaInfo(entityType);
    const repo = await prepareDataSource(schemaInfo, requestId);
    let query = repo
        .createQueryBuilder(schemaInfo.tablename)
        .where(schemaInfo.tablename+"."+Object.keys(searchCriteria)[0]+ "= :"+Object.keys(searchCriteria)[0], {[Object.keys(searchCriteria)[0]]: searchCriteria[Object.keys(searchCriteria)[0]]})

    if (Object.keys(searchCriteria).length>1){
        for(let i = 1; i<=Object.keys(searchCriteria).length-1; i++){
            query = query.andWhere(schemaInfo.tablename+"."+Object.keys(searchCriteria)[i]+ "= :"+Object.keys(searchCriteria)[i], {[Object.keys(searchCriteria)[i]]: searchCriteria[Object.keys(searchCriteria)[i]]})
        }
    }
    const entity = await query.addSelect([schemaInfo.tablename+".argoId"]).getOne();
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
    const keyCriteria = process.env[entity] as {};
    return keyCriteria
}

export function getSchemaInfo(entity: string){
    let schemaInfo = {} as SchemaInfo;
    schemaInfo = JSON.parse(process.env[entity+`_schema`]);
    return schemaInfo;
}


/// To check
// return just the id and not the whole entity