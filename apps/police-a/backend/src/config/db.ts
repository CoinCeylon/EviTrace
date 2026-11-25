import pg, { type QueryResult, type QueryResultRow } from 'pg';

const { Pool } = pg; 

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
	});

pool.on('error', (err: Error) => {
	console.error(`[${process.env.INSTITUTION_ID}] Unexpected PostgreSQL error: `, err);
	});

export const query = <T extends QueryResultRow = QueryResultRow> (
	text: string,
	params?: unknown[]
): Promise<QueryResult<T>> => {
	return pool.query<T>(text, params);
};

export { pool };
