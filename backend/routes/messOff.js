import express from 'express';
import MessOff from '../db/models/MessOff.js';

const router = express.Router();

// Student sets mess off
router.post('/', async (req, res) => {
  try {
    const { studentId, fromDate, toDate, days } = req.body;
    const messOff = new MessOff({ studentId, fromDate, toDate, days });
    await messOff.save();
    res.status(201).json(messOff);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save mess off', error: err });
  }
});

// Admin fetches all mess off records
router.get('/', async (req, res) => {
  try {
    const records = await MessOff.find().populate('studentId');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch mess off records', error: err });
  }
});

export default router; 