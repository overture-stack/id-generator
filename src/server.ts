import * as express from 'express';
import { findIdForEntity, getIdForEntity, root } from './routes/root';
import { defaultErrorHandler } from './middlewares/error-handler';
import { initializeDBSequences } from './middlewares/datasource';
import * as config from './config';

const cors = require('cors');
const app = express();

function setupExpress() {
	app.use(cors({ origin: true }));
	app.route('/').get(root);
	app.route(config.requestRoute).get(getIdForEntity);
	app.route(config.requestRoute + '/find').get(findIdForEntity);
	app.use(defaultErrorHandler);
}

function startServer() {
	app.listen(config.port, () => {
		console.log(`HTTP REST API SERVER available at http://localhost:${config.port}`);
	});
}

async function main() {
	try {
		await initializeDBSequences();
		setupExpress();
		startServer();
		console.log('Server started successfully');
	} catch (error) {
		console.error('Error starting server:', error);
	}
}

main();
