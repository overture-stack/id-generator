import {AppDataSource} from "../data-source";
import {Donor} from "../models/donor";
import {Specimen} from "../models/specimen";
import {Sample} from "../models/sample";
import {Treatment} from "../models/treatment";
import {PrimaryDiagnosis} from "../models/primary_diagnosis";
import {Chemotherapy} from "../models/chemotherapy";
import {HormoneTherapy} from "../models/hormone_therapy";


export function getRepo(entityType: String){

    if (entityType === "donor") {
        return AppDataSource.getRepository(Donor);
    }
    else if (entityType === "specimen"){
        return AppDataSource.getRepository(Specimen);
    }
    else if (entityType === "sample"){
        return AppDataSource.getRepository(Sample);
    }
    else if (entityType === "treatment"){
        return AppDataSource.getRepository(Treatment);
    }
    else if (entityType === "primary_diagnosis"){
        return AppDataSource.getRepository(PrimaryDiagnosis);
    }
    else if (entityType === "chemotherapy"){
        return AppDataSource.getRepository(Chemotherapy);
    }
    else if (entityType === "hormone_therapy"){
        return AppDataSource.getRepository(HormoneTherapy);
    }
}


export function getEntity(entityType: String){
    if (entityType === "donor") {
        return new Donor();
    }
    else if (entityType === "specimen"){
        return new Specimen();
    }
    else if (entityType === "sample"){
        return new Sample();
    }
    else if (entityType === "treatment"){
        return new Treatment();
    }
    else if (entityType === "primary_diagnosis"){
        return new PrimaryDiagnosis();
    }
    else if (entityType === "chemotherapy"){
        return new Chemotherapy();
    }
    else if (entityType === "hormone_therapy"){
        return new HormoneTherapy();
    }

}