import express from 'express';
import Payment from '../db/models/Payment.js';
import Student from '../db/models/Student.js';
// import Room from '../db/models/Room.js'; // Remove Room model import

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { month, year } = req.body; // amount is now fixed, no longer required from body
    const now = new Date();
    const billingMonth = month || (now.getMonth() + 1);
    const billingYear = year || now.getFullYear();

    // Hardcode hostel fee amount back to 5000
    const hostelFeeAmount = 5000; 

    const students = await Student.find({});
    let created = 0;
    // let skipped = 0; // No longer needed as we're not skipping based on room

    for (const student of students) {
      // Check if fee already exists for this student and month/year
      const exists = await Payment.findOne({
        studentId: student._id,
        paymentType: 'hostel_fee',
        billingMonth,
        billingYear
      });

      if (!exists) {
        

        await Payment.create({
          studentId: student._id,
          amount: hostelFeeAmount,
          status: 'pending',
          paymentType: 'hostel_fee',
          billingMonth,
          billingYear
        });
        created++;
      }
    }
    res.json({ message: `Hostel fees generated for ${created} students for ${billingMonth}/${billingYear}.` }); // Removed skipped students message
  } catch (err) {
    console.error('Error generating hostel fees:', err);
    res.status(500).json({ message: 'Failed to generate hostel fees', error: err.message });
  }
});

// Get hostel fee status for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;

    let query = {
      studentId,
      paymentType: 'hostel_fee'
    };

    if (month && year) {
      query.billingMonth = parseInt(month);
      query.billingYear = parseInt(year);
    }

    const payments = await Payment.find(query)
      .sort({ billingYear: -1, billingMonth: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching hostel fees:', error);
    res.status(500).json({ message: 'Error fetching hostel fees' });
  }
});

export default router; 