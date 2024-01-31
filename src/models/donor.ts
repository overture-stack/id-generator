import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn} from "typeorm";
import {AppDataSource} from "../data-source";


@Entity({
    name: "donors"
})
@Unique('submitter_donor_unq',["submitterId", "programId"], ) // check this combination
export class Donor {

    @PrimaryGeneratedColumn()
    id: string;

    @Column({name: "submitter_id"})
    submitterId: string;

    @Column({name: "program_id"})
    programId: string;

    @Column({name: "donor_id",
        default: () => `nextval('idGen.donor_seq')`})
    donorId: number;

    @Column({name: "entity_type"})
    entityType: string;

    @CreateDateColumn({name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({name: "updated_at"})
    updateAt: Date;

    constructor(submitterId: string, programId: string) {
        this.submitterId = submitterId;
        this.programId = programId;
        this.entityType = "Donor"
    }

}
