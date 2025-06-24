import express from 'express';
import MessMenu from '../db/models/MessMenu.js';

const router = express.Router();

// Create or update mess menu for a specific date
router.post('/', async (req, res) => {
  try {
    const { date, breakfast, lunch, snacks, dinner } = req.body;

    // Ensure the date is at the start of the day for consistent unique key
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    let messMenu = await MessMenu.findOne({ date: startOfDay });

    if (messMenu) {
      // Update existing menu
      messMenu.breakfast = breakfast;
      messMenu.lunch = lunch;
      messMenu.snacks = snacks;
      messMenu.dinner = dinner;
    } else {
      // Create new menu
      messMenu = new MessMenu({
        date: startOfDay,
        breakfast,
        lunch,
        snacks,
        dinner,
      });
    }

    await messMenu.save();
    res.status(200).json({ message: 'Mess menu updated successfully', messMenu });
  } catch (error) {
    console.error('Error updating mess menu:', error);
    res.status(500).json({ message: 'Failed to update mess menu' });
  }
});

// Get mess menu for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    const queryDate = new Date(req.params.date);
    queryDate.setHours(0, 0, 0, 0); // Ensure consistency with stored date

    const messMenu = await MessMenu.findOne({ date: queryDate });

    if (!messMenu) {
      return res.status(404).json({ message: 'Mess menu not found for this date' });
    }
    res.status(200).json(messMenu);
  } catch (error) {
    console.error('Error fetching mess menu by date:', error);
    res.status(500).json({ message: 'Failed to fetch mess menu' });
  }
});

// Get all mess menus (e.g., for admin to view history)
router.get('/', async (req, res) => {
  try {
    const messMenus = await MessMenu.find().sort({ date: -1 });
    res.status(200).json(messMenus);
  } catch (error) {
    console.error('Error fetching all mess menus:', error);
    res.status(500).json({ message: 'Failed to fetch mess menus' });
  }
});

export default router; 