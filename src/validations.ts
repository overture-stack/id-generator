import {z, ZodArray, ZodString} from "zod";

export function validateString(name: string){
    return z
        .string({
            //required_error: 'property '+name+ ' is required',
            invalid_type_error: 'property '+name+ ' not a string'
        })
        .trim()
        .min(1, { message: name+ ' cannot be empty' })
        .parse(getRequiredEnvVar(name));
}



function getRequiredEnvVar(name: string){
    const property = process.env[name] as string;
    if(!property || property.trim().length==0){
        throw new Error("config file is missing property "+name);
    }

}
function getRequiredNumber(){}
function getRequiredString(){}


export const getRequiredEnvNumber = (name: string): number => {
    const value = getRequiredEnvVar(name);
    const numberValue = z.number().finite().safeParse(value);

    if(!numberValue.success) {
        throw new Error("property "+name+" in config is not a valid number")
    }

    return numberValue.data;
}


export const getRequiredEnvString = (name: string): string => {
    const value = getRequiredEnvVar(name);
    const stringValue = z.string().safeParse(value)

    if(!stringValue.success) {
        throw new Error("property "+name+" in config is not a valid string")
    }

    return stringValue.data;
}

export const getRequiredArray = (name: string): ZodString["_output"][] => {
    const value = getRequiredEnvVar(name);
    const stringArray = z.array(z.string()).safeParse(value);

    if(!stringArray.success) {
        throw new Error("property "+name+" in config is not a valid string")
    }

    return stringArray.data;
}
