import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn} from "typeorm";


@Entity({
    name: "donor"
})
@Unique('submitter_donor_uniq',["submitterId", "programId"], ) // check this combination
export class Donor {

    @PrimaryGeneratedColumn()
    id: string;

    @Column({name: "submitter_id"})
    submitterId: string;

    @Column({name: "program_id"})
    programId: string;

    @Column({name: "argo_id",
        default: () => `nextval('idGen.donor_seq')`})
    argoId: number;

    @Column({name: "entity_type"})
    entityType: string;

    @CreateDateColumn({name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({name: "updated_at"})
    updateAt: Date;

    constructor(){}

    submitter(submitter: string): Donor {
        this.submitterId = submitter;
        return this;
    }

    program(program: string): Donor {
        this.programId = program;
        return this;
    }

    entity(type: string): Donor {
        this.entityType = type;
        return this;
    }

}
