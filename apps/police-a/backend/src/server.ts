import app from './app.js';
import { initDb } from './config/initDb.js';

const PORT = Number(process.env.PORT) || 4001;

async function startServer(): Promise<void> {
	try {
		await initDb();
		app.listen(PORT, () => {
			console.log(`[${process.env.INSTITUTION_ID}] ${process.env.INSTITUTION_NAME} running on https://localhost:${PORT}`);
		});
	} catch (error) {
	console.error(`[${process.env.INSTITUTION_ID}] Failed to start server:`, error);
	process.exit(1);
	}
}

startServer();
