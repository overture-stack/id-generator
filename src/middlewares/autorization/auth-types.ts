import {NextFunction, Request, Response} from "express";

export const authList = ['EGO', 'KEYCLOAK', 'NONE'] as const;
export type AuthStrategy= 'EGO' | 'KEYCLOAK' | 'NONE';

export interface AuthorizationStrategy {
    authHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
}