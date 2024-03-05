
import { findIdForEntity, getIdForEntity, root } from './routes/root.js';
import { defaultErrorHandler } from './middlewares/error-handler.js';
import { initializeDBSequences } from './middlewares/datasource.js';
import * as config from './config.js';
import cors from 'cors'
import  express from "express";
import path from "path";
import yaml from "yamljs";
import * as swaggerUi from 'swagger-ui-express';

//const cors = require('cors');
//const app = express();
//const cors = cors();
const app = express();

function setupExpress() {
	app.use(cors({ origin: true }));
	app.route('/').get(root);
	app.route(config.requestRoute).get(getIdForEntity);
	app.route(config.requestRoute + '/find').get(findIdForEntity);
	app.use(
		'/api-docs',
		swaggerUi.serve,
		swaggerUi.setup(yaml.load('src/resources/swagger.yaml')),
	);
	app.use(defaultErrorHandler);
}

function startServer() {
	app.listen(config.port, () => {
		console.log(`HTTP REST API SERVER available at http://localhost:${config.port}`);
	});
}

/*async function main() {
	try {
		await initializeDBSequences();
		setupExpress();
		startServer();
		console.log('Server started successfully');
	} catch (error) {
		console.error('Error starting server:', error);
	}
}

main();*/

await initializeDBSequences();
setupExpress();
startServer();
console.log('Server started successfully');