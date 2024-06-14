import {NextFunction, Request, Response} from "express";

export const authList = ['EGO', 'KEYCLOAK', 'NONE'] as const;
export type AuthStrategy = 'EGO' | 'KEYCLOAK' | 'NONE';

export const apiList = ['CREATE', 'FIND'] as const;
export type SecuredApi = 'CREATE' | 'FIND';

export interface AuthorizationStrategy {
    authHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
}