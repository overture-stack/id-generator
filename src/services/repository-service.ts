import {AppDataSource} from "../data-source";
import {Donor} from "../models/donor";
import {Specimen} from "../models/specimen";
import {Sample} from "../models/sample";


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
}