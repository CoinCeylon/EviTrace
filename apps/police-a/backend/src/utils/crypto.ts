import crypto from 'node:crypto';
import fs from 'node:fs';

export function generateId(prefix: string): string {
	const shortUuid = crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
	return `${prefix}-${shortUuid}`;
}

export function hashFile(filePath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const hash = crypto.createHash('sha256');
		const stream = fs.createReadStream(filePath);
	
		stream.on('data', (chunk) => hash.update(chunk));
		stream.on('end', () => resolve(hash.digest('hex')));
		stream.on('error', (err) => reject(err));
	});
}

export function hashEventPayload(payload: Record<string, unknown>): string {
	const sortedKeys = Object.keys(payload).sort();
	const canonicalJson = JSON.stringify(payload, sortedKeys);
	return crypto.createHash('sha256').update(canonicalJson).digest('hex');
}

export function signEventHash(eventHash: string): string {
	const secret = process.env.SIGNING_SECRET || `dev-secret-${process.env.INSTITUTION_ID || 'POLICE_A'}`;
	if (!secret) {
		throw new Error('SIGNING_SECRET environment variable is required');
	}
	return crypto.createHmac('sha256', secret).update(eventHash).digest('hex');
}
