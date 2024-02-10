import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn} from "typeorm";
import {AppDataSource} from "../data-source";


@Entity({
    name: "treatment"
})
@Unique('submitter_treatment_uniq',["submitterId", "programId"], ) // check this combination
export class Treatment {

    @PrimaryGeneratedColumn()
    id: string;

    @Column({name: "submitter_id"})
    submitterId: string;

    @Column({name: "program_id"})
    programId: string;

    @Column({name: "treatment_id",
        default: () => `nextval('idGen.treatment_seq')`})
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

    submitter(submitter: string): Treatment {
        this.submitterId = submitter;
        return this;
    }

    program(program: string): Treatment {
        this.programId = program;
        return this;
    }

    entity(type: string): Treatment {
        this.entityType = type;
        return this;
    }
}
