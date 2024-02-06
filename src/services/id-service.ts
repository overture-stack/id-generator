
import {NextFunction, Request, Response} from "express"
import {getEntity, getRepo} from "./repository-service";
import {IdGenerationError} from "../middlewares/error-handler";
import {entityTypes} from "../models/entity-types";

// create new id
 async function createId(programId: string, submitterId: string, entityType: string){
    const entity = getRepo(entityType).create(getEntity(entityType).submitter(submitterId).program(programId).entity(entityType));
    const savedEntity = await getRepo(entityType).save(entity);
    return savedEntity.argoId;
}

// check if an argo id exists for the submitter and program
 async function findId(programId: string, submitterId: string, entityType: string){
     const entity = await getRepo(entityType).createQueryBuilder(entityType)
         .where(entityType+".submitter_id = :subId", {subId: submitterId})
         .andWhere( entityType+".program_id = :prId", {prId: programId})
         .getOne();
     return entity?.argoId;
}


export async function getId(request: Request, response: Response, next: NextFunction){
    const programId = request.params.programId;
    const submitterId  = request.params.submitterId;
    const entityType = request.params.entityType;

    if(!Object.values(entityTypes).includes(entityType)){
        next(new IdGenerationError("invalid entity type"));
    }

    let id = await findId(programId, submitterId, entityType);
    if(!id){
        id = await createId(programId, submitterId, entityType);
    }
    return id;
}

