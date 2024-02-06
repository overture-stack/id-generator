import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn} from "typeorm";
import {AppDataSource} from "../data-source";


@Entity({
    name: "sample"
})
@Unique('submitter_sample_uniq',["submitterId", "programId"], ) // check this combination
export class Sample {

    @PrimaryGeneratedColumn()
    id: string;

    @Column({name: "submitter_id"})
    submitterId: string;

    @Column({name: "program_id"})
    programId: string;

    @Column({name: "specimen_id",
        default: () => `nextval('idGen.sample_seq')`})
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

    submitter(submitter: string): Sample {
        this.submitterId = submitter;
        return this;
    }

    program(program: string): Sample {
        this.programId = program;
        return this;
    }

    entity(type: string): Sample {
        this.entityType = type;
        return this;
    }
}
