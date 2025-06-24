import express from 'express';
import RoomChangeRequest from '../db/models/RoomChangeRequest.js';
import Student from '../db/models/Student.js';
import Room from '../db/models/Room.js';
import { updateRoomOccupancy } from './roomRoutes.js';

const router = express.Router();

// GET all room change requests (for admin)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }
    const requests = await RoomChangeRequest.find(query).populate('studentId');
    res.json(requests);
  } catch (error) {
    console.error('Error fetching room change requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH: Approve a room change request
router.patch('/:id/approve', async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const request = await RoomChangeRequest.findById(requestId).populate('studentId');

    if (!request) {
      return res.status(404).json({ message: 'Room change request not found.' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending and cannot be approved.' });
    }

    const student = request.studentId;
    const oldHostel = student.hostel;
    const oldRoomNumber = student.roomNumber;
    const newHostel = request.newHostel;
    const newRoomNumber = request.newRoomNumber;

    // Verify new room availability again before approving
    const newRoom = await Room.findOne({ roomNumber: newRoomNumber, hostel: newHostel });
    if (!newRoom) {
      request.status = 'rejected';
      request.adminNotes = 'Requested room no longer exists.';
      await request.save();
      return res.status(400).json({ message: 'Requested room no longer exists. Request rejected.' });
    }
    if (newRoom.currentOccupancy >= newRoom.capacity) {
      request.status = 'rejected';
      request.adminNotes = 'Requested room is now fully occupied.';
      await request.save();
      return res.status(400).json({ message: 'Requested room is now fully occupied. Request rejected.' });
    }

    // Perform the actual room change for the student
    student.hostel = newHostel;
    student.roomNumber = newRoomNumber;
    await student.save();

    // Update room occupancy for old and new rooms
    if (oldRoomNumber && oldHostel) {
      await updateRoomOccupancy(oldRoomNumber, oldHostel);
    }
    await updateRoomOccupancy(newRoomNumber, newHostel);

    // Update request status
    request.status = 'approved';
    request.resolutionDate = new Date();
    await request.save();

    res.status(200).json({ message: 'Room change request approved and student room updated.', request });
  } catch (error) {
    console.error('Error approving room change request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH: Reject a room change request
router.patch('/:id/reject', async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const { adminNotes } = req.body; // Optional notes from admin

    const request = await RoomChangeRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Room change request not found.' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending and cannot be rejected.' });
    }

    request.status = 'rejected';
    request.resolutionDate = new Date();
    request.adminNotes = adminNotes || 'Rejected by administrator.';
    await request.save();

    res.status(200).json({ message: 'Room change request rejected.', request });
  } catch (error) {
    console.error('Error rejecting room change request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 