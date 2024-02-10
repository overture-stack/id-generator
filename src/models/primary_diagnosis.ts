import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn} from "typeorm";
import {AppDataSource} from "../data-source";


@Entity({
    name: "primary_diagnosis"
})
@Unique('submitter_primary_diag_uniq',["submitterId", "programId"], ) // check this combination
export class PrimaryDiagnosis {

    @PrimaryGeneratedColumn()
    id: string;

    @Column({name: "submitter_id"})
    submitterId: string;

    @Column({name: "program_id"})
    programId: string;

    @Column({name: "primary_diagnosis_id",
        default: () => `nextval('idGen.primary_diagnosis_seq')`})
    argoId: number;

    @Column({name: "entity_type"})
    entityType: string;

    @CreateDateColumn({name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({name: "updated_at"})
    updateAt: Date;

    /*constructor(submitterId: string, programId: string) {
        this.submitterId = submitterId;
        this.programId = programId;
        this.entityType = "Specimen"
    }*/

    constructor(){}

    submitter(submitter: string): PrimaryDiagnosis {
        this.submitterId = submitter;
        return this;
    }

    program(program: string): PrimaryDiagnosis {
        this.programId = program;
        return this;
    }

    entity(type: string): PrimaryDiagnosis {
        this.entityType = type;
        return this;
    }
}
