const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/auth');
const { query, body } = require('express-validator');

const router = express.Router();

// Public route - no auth required
router.get('/trains', [
    query('source').notEmpty(),
    query('destination').notEmpty()
], bookingController.getAvailableTrains);

// Protected routes
router.use(authMiddleware);

router.post('/book', [
    body('trainId').isInt()
], bookingController.bookSeat);

router.get('/:bookingId', bookingController.getBookingDetails);

module.exports = router;
