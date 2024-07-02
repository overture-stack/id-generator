import {NextFunction, Request, Response} from "express";

export const authList = ['EGO', 'KEYCLOAK', 'NONE'] as const;
export type AuthStrategy = (typeof authList)[number];

export const apiList = ['CREATE', 'FIND'] as const;

export interface AuthorizationStrategy {
    authHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
}