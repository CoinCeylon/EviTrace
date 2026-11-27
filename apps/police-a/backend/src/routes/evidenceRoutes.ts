import { Router } from 'express';
import {
    getEvidenceById,
    listEvidence,
    registerEvidence,
} from '../controllers/evidenceController.js';
import { uploadEvidenceFile } from '../middleware/upload.js';

const router = Router();

router.post('/', uploadEvidenceFile.single('file'), registerEvidence);
router.get('/', listEvidence);
router.get('/:id', getEvidenceById);

export default router;