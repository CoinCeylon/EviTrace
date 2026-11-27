import fs from 'node:fs/promises';
import type { Request, Response } from 'express';
import { pool, query } from '../config/db.js';
import {
  generateId,
  hashEventPayload,
  hashFile,
  signEventHash,
} from '../utils/crypto.js';

export async function registerEvidence(req: Request, res: Response): Promise<void> {
  const {
    case_id,
    description,
    evidence_type,
    collection_date,
    location,
    collecting_officer,
    condition,
    seal_ref,
  } = req.body as Record<string, string | undefined>;

  if (!case_id || !description || !evidence_type) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(400).json({
      error: 'Missing required fields: case_id, description, and evidence_type are required.',
    });
    return;
  }

  const evidenceId = generateId('EVD');
  const eventId = generateId('EVT');
  const institutionId = process.env.INSTITUTION_ID || 'POLICE_A';
  const eventTimestamp = new Date().toISOString();

  let filePath: string | null = null;
  let fileHash: string | null = null;

  const client = await pool.connect();

  try {
    if (req.file) {
      filePath = req.file.path;
      fileHash = await hashFile(req.file.path);
    }

    const eventPayload = {
      event_id: eventId,
      evidence_id: evidenceId,
      case_id,
      event_type: 'REGISTERED',
      from_institution: institutionId,
      to_institution: institutionId,
      officer_name: collecting_officer ?? null,
      recorded_condition: condition ?? null,
      file_hash: fileHash,
      event_timestamp: eventTimestamp,
    };

    const eventHash = hashEventPayload(eventPayload);
    const signature = signEventHash(eventHash);

    await client.query('BEGIN');

    const evidenceResult = await client.query(
      `INSERT INTO evidence (
        evidence_id, case_id, description, evidence_type, collection_date,
        location, collecting_officer, condition, seal_ref, file_path, file_hash, current_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'REGISTERED')
      RETURNING *`,
      [
        evidenceId,
        case_id,
        description,
        evidence_type,
        collection_date ?? null,
        location ?? null,
        collecting_officer ?? null,
        condition ?? null,
        seal_ref ?? null,
        filePath,
        fileHash,
      ]
    );

    const eventResult = await client.query(
      `INSERT INTO events (
        event_id, evidence_id, event_type, from_institution, to_institution,
        officer_name, recorded_condition, event_timestamp, event_hash, signature, tx_status
      ) VALUES ($1, $2, 'REGISTERED', $3, $4, $5, $6, $7, $8, $9, 'Pending')
      RETURNING *`,
      [
        eventId,
        evidenceId,
        institutionId,
        institutionId,
        collecting_officer ?? null,
        condition ?? null,
        eventTimestamp,
        eventHash,
        signature,
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Evidence registered successfully',
      evidence: evidenceResult.rows[0],
      initialEvent: eventResult.rows[0],
    });
  } catch (err: unknown) {
    await client.query('ROLLBACK');
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    const message = err instanceof Error ? err.message : 'Failed to register evidence';
    res.status(500).json({ error: message });
  } finally {
    client.release();
  }
}

export async function listEvidence(_req: Request, res: Response): Promise<void> {
  try {
    const result = await query(
      'SELECT * FROM evidence ORDER BY created_at DESC'
    );
    res.json({
      count: result.rowCount,
      evidence: result.rows,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch evidence list';
    res.status(500).json({ error: message });
  }
}

export async function getEvidenceById(req: Request, res: Response): Promise<void> {
  const evidenceId = String(req.params.id);

  try {
    const evidenceResult = await query(
      'SELECT * FROM evidence WHERE evidence_id = $1',
      [evidenceId]
    );

    if (evidenceResult.rowCount === 0) {
      res.status(404).json({ error: `Evidence ${evidenceId} not found.` });
      return;
    }

    const eventsResult = await query(
      'SELECT * FROM events WHERE evidence_id = $1 ORDER BY event_timestamp ASC',
      [evidenceId]
    );

    res.json({
      evidence: evidenceResult.rows[0],
      events: eventsResult.rows,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch evidence details';
    res.status(500).json({ error: message });
  }
}