import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

const uploadDir = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, uploadDir)
	},
	filename: (_req, file, cb) => {
		const ext = path.extname(file.originalname).toLowerCase();
		const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
		cb(null, `evidence-${uniqueSuffix}${ext}`);
	},
});

export const uploadEvidenceFile = multer({
	storage,
	limits: {
	fileSize: 25 * 1024 * 1024,
	},
});
