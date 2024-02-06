import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn} from "typeorm";
import {AppDataSource} from "../data-source";


@Entity({
    name: "specimen"
})
@Unique('submitter_specimen_uniq',["submitterId", "programId"], ) // check this combination
export class Specimen {

    @PrimaryGeneratedColumn()
    id: string;

    @Column({name: "submitter_id"})
    submitterId: string;

    @Column({name: "program_id"})
    programId: string;

    @Column({name: "specimen_id",
        default: () => `nextval('idGen.specimen_seq')`})
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

    submitter(submitter: string): Specimen {
        this.submitterId = submitter;
        return this;
    }

    program(program: string): Specimen {
        this.programId = program;
        return this;
    }

    entity(type: string): Specimen {
        this.entityType = type;
        return this;
    }
}
