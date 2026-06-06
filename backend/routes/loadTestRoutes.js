import express from 'express';
import { runLoadTest, getLoadTestsByAnalysis } from '../controllers/loadTestController.js';

const router = express.Router();

router.get('/run', runLoadTest);
router.get('/analysis/:analysisId', getLoadTestsByAnalysis);

export default router;
