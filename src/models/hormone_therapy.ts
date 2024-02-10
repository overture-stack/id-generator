import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn} from "typeorm";
import {AppDataSource} from "../data-source";


@Entity({
    name: "hormone_therapy"
})
@Unique('submitter_hormone_therapy_uniq',["submitterId", "programId"], ) // check this combination
export class HormoneTherapy {

    @PrimaryGeneratedColumn()
    id: string;

    @Column({name: "submitter_id"})
    submitterId: string;

    @Column({name: "program_id"})
    programId: string;

    @Column({name: "hormone_therapy_id",
        default: () => `nextval('idGen.hormone_therapy_seq')`})
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

    submitter(submitter: string): HormoneTherapy {
        this.submitterId = submitter;
        return this;
    }

    program(program: string): HormoneTherapy {
        this.programId = program;
        return this;
    }

    entity(type: string): HormoneTherapy {
        this.entityType = type;
        return this;
    }
}
