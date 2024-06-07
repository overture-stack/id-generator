import { findIdForEntity, getIdForEntity, root } from './routes/root.js';
import { defaultErrorHandler } from './middlewares/error-handler.js';
import { initializeDB, initializeDBSequences } from './middlewares/datasource.js';
import * as config from './config.js';
import cors from 'cors';
import express from 'express';
import yaml from 'yamljs';
import * as swaggerUi from 'swagger-ui-express';

const app = express();

function setupExpress() {
	app.use(cors({ origin: true }));
	app.route('/').get(root);
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

await initializeDBSequences();
await initializeDB();
setupExpress();
startServer();
console.log('Server started successfully');
