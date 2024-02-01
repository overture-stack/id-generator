
import {NextFunction, Request, Response} from "express"
import {AppDataSource} from "../data-source";
import {Donor} from "../models/donor";


const donorRepo = AppDataSource.getRepository(Donor);

// create donor entry
 async function createId(programId: string, submitterId: string ){
    const donor = donorRepo.create(new Donor(submitterId, programId));
    const savedDonor = await donorRepo.save(donor);
    return savedDonor.donorId;
}

// check if a donor id exists for the submitter and program
 async function getDonorId(programId: string, submitterId: string){
     const donor = await donorRepo.createQueryBuilder("donors")
         .where("donors.submitter_id = :subId", {subId: submitterId})
         .andWhere( "donors.program_id = :prId", {prId: programId})
         .getOne();
     return donor?.donorId;
}


export async function getId(request: Request, response: Response){

    const programId = request.params.programId;
    const submitterId  = request.params.submitterId;

    let donorId = await getDonorId(programId, submitterId);
    if(!donorId){
        donorId = await createId(programId, submitterId);
    }
    response.status(200).json(donorId);
}
