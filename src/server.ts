import * as express from 'express';
import { getIdForEntity, root } from './routes/root';
import { defaultErrorHandler } from './middlewares/error-handler';
import { createSequences, getSequenceDefinition, getTableDefinition } from './middlewares/datasource';
import * as config from './config';

const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

function setupExpress() {
	app.use(cors({ origin: true }));
	//app.use(bodyParser.json());

	app.route('/').get(root);
	//app.route(process.env["REQUEST_ROUTE"]).get(getIdForEntity);
	app.route(config.requestRoute).get(getIdForEntity);
	app.use(defaultErrorHandler);
}

function startServer() {
	app.listen(config.port, () => {
		console.log(`HTTP REST API SERVER available at http://localhost:${config.port}`);
	});
}

async function initializeDBSequences() {
	const sequenceList = getSequenceDefinition();
	sequenceList.forEach((seq) => {
		createSequences(seq)
			.then(() => console.log('Sequence ' + seq + ' created'))
			.catch((err) => console.log('Error ' + err + ' upon ' + seq + ' sequence creation'));
	});
}

async function main() {
	try {
		await initializeDBSequences();
		await setupExpress();
		await startServer();
		console.log('Server started successfully');
	} catch (error) {
		console.error('Error starting server:', error);
	}
}

main();
