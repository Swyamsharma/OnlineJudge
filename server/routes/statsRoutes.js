import express from 'express';
import { getPublicStats } from '../controllers/statsController.js';

const router = express.Router();

router.route('/').get(getPublicStats);

export default router;