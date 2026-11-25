import { query } from './db.js';

export async function initDb(): Promise<void> {
	await query (`
		CREATE TABLE IF NOT EXISTS evidence (
			evidence_id VARCHAR(64) PRIMARY KEY,
			case_id VARCHAR(64) NOT NULL,
			description TEXT NOT NULL,
			evidence_type VARCHAR(100) NOT NULL,
			collection_date TIMESTAMPTZ,
			location VARCHAR(255),
			collecting_officer VARCHAR(150),
			condition VARCHAR(150),
			seal_ref VARCHAR(100),
			file_path TEXT,
			file_hash VARCHAR(64),
			current_status VARCHAR(50) NOT NULL DEFAULT 'REGISTERED',
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		);
		`);

	await query (`
		CREATE TABLE IF NOT EXISTS events (
			event_id VARCHAR(64) PRIMARY KEY,
			evidence_id VARCHAR(64) NOT NULL REFERENCES evidence(evidence_id) ON DELETE CASCADE,
			event_type VARCHAR(64) NOT NULL,
			from_institution VARCHAR(64) NOT NULL, 
			to_institution VARCHAR(64),
			officer_name VARCHAR(64),
			recorded_condition VARCHAR(150),
			event_timestamp TIMESTAMPTZ NOT NULL,
			event_hash VARCHAR(64) NOT NULL, 
			signature TEXT NOT NULL,
			tx_id VARCHAR(128),
			tx_status VARCHAR(20) NOT NULL DEFAULT 'Pending'
				CHECK (tx_status IN ('Pending', 'Submitted', 'Confirmed', 'Failed')),
			created_at TIMESTAMPTZ DEFAULT NOW()	
		);
		`);

	await query(`
		CREATE TABLE IF NOT EXISTS institutions (
			institution_id VARCHAR(64) PRIMARY KEY, 
			institution_name VARCHAR(150) NOT NULL,
			api_url TEXT NOT NULL,
			public_key TEXT,
			created_at TIMESTAMPTZ DEFAULT NOW()

		);
		`);

	console.log(`[${process.env.INSTITUTION_ID}] Database tables verified/created.`);

}
