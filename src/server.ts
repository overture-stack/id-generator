
import {findIdForEntity, getIdForEntity, root} from './routes/root.js';
import { defaultErrorHandler } from './middlewares/error-handler.js';
import {initializeDB, initializeDBSequences} from './middlewares/datasource.js';
import * as config from './config.js';
import cors from 'cors';
import express from 'express';
import yaml from 'yamljs';
import * as swaggerUi from 'swagger-ui-express';
import { egoAuthHandler } from './middlewares/ego_auth.js';
import {generators, Issuer} from "openid-client";
import {keycloakAuthHandler} from "./middlewares/keycloak_auth.js";

const app = express();

function setupExpress() {
	app.use(cors({ origin: true }));
	app.route('/').get(root);
	//app.use(egoAuthHandler);
	app.use(keycloakAuthHandler);
	//app.route('/authUtil').get(authUtil);
	app.route(config.requestRoute).get(getIdForEntity);
	app.route(config.requestRoute + '/find').get(findIdForEntity);
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(yaml.load('src/resources/swagger.yaml')));
	app.use(defaultErrorHandler);
}

function startServer() {
	app.listen(config.port, () => {
		console.log(`HTTP REST API SERVER available at http://localhost:${config.port}`);
		console.log(`Swagger docs available at http://localhost:${config.port}/api-docs`);
	});
}


/*export interface IntrospectionResponseLocal {
	active: boolean;
	client_id?: string;
	exp?: number;
	iat?: number;
	sid?: string;
	iss?: string;
	jti?: string;
	username?: string;
	aud?: string | string[];
	scope: string;
	sub?: string;
	nbf?: number;
	token_type?: string;
	cnf?: {
		'x5t#S256'?: string;

		[key: string]: any;
	};

	[key: string]: any;
}


const kcIssuer = await Issuer.discover('http://localhost/realms/myrealm/.well-known/openid-configuration');
console.log('Discovered issuer %s %O', kcIssuer.issuer);
console.log('Discovered issuer %s %O', kcIssuer.metadata);


const client = new kcIssuer.Client({
	client_id: 'clinical',
	client_secret: 'fArkN1fePj3MFksj7vaTb4AbzHGYkHMv',
	scope: 'openid'
});


const tokenSet = await client.grant({
	grant_type: 'client_credentials'
});

console.log("TOken: "+tokenSet);
console.log("Access: "+tokenSet.access_token);
console.log("id: "+tokenSet.id_token);

const access_token: string  = tokenSet.access_token || '';
const tokenjson = await client.introspect(tokenSet.access_token|| '');
console.log("iss: "+tokenjson.iss);
console.log("scope: "+tokenjson.scope);
console.log("aud: "+tokenjson.aud);*/

await initializeDBSequences();
await initializeDB();
setupExpress();
startServer();
console.log('Server started successfully');

/*const tokenPerm = await client.grant({
	grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
	audience: 'IDGeneration',
	//response_mode: 'decision',
	//permission: 'someResourse'
});

console.log("tokenPerm: "+tokenPerm.access_token);
//console.log("tokenPerm: "+tokenPerm.result);
const tokenPermJson: IntrospectionResponseLocal = await client.introspect(tokenPerm.access_token|| '');
console.log("tokenPermJson scopes:"+tokenPermJson.authorization['permissions'][0].scopes[0]);
console.log("tokenPermJson rsname:"+tokenPermJson.authorization['permissions'][0].rsname);
console.log("tokenPermJson auth:"+JSON.stringify(tokenPermJson));


// -- some user auth (login flow) stuff
export const code_verifier = generators.codeVerifier();
const code_challenge = generators.codeChallenge(code_verifier);

export const newClient = new kcIssuer.Client({
	client_id: 'clinical',
	client_secret: 'fArkN1fePj3MFksj7vaTb4AbzHGYkHMv',
	redirect_uris: ['http://localhost:9001/'],
	response_types: ['code'],
	// id_token_signed_response_alg (default "RS256")
	// token_endpoint_auth_method (default "client_secret_basic")
});

newClient.authorizationUrl({
	scope: 'openid email profile',
	resource: 'https://my.api.example.com/resource/32178',
	code_challenge,
	code_challenge_method: 'S256',
});*/

