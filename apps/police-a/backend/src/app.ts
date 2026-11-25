import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { query } from './config/db.js';

const app = express();

app.use(cors());
app.use(express.json());

interface DbHealthRow {
	current_database: string;
	now: Date;
}

app.get('/api/health', async (_req: Request, res: Response) => {
	try {
		const dbCheck = await query<DbHealthRow>('SELECT current_database(), NOW()');
		res.json({
			status: 'OK',
			institutionID: process.env.INSTITUTION_ID,
			institutionName: process.env.INSTITUTION_NAME,
			role: process.env.INSTITUTION_ROLE,
			port: process.env.PORT,
			database: dbCheck.rows[0].current_database,
			dbConnected: true,
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Unknown database error';
		res.status(500).json({ status: 'ERROR', dbConnected: false, error: message });
	}
});

export default app;
