import express from 'express';
import { searchStops } from '../controllers/station/stopController.js';

const router = express.Router();

router.get('/search', searchStops);

export default router;
