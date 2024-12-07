const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');
const { body } = require('express-validator');

const router = express.Router();

// All admin routes require both auth and admin middlewares
router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/trains', [
    body('trainNumber').notEmpty(),
    body('source').notEmpty(),
    body('destination').notEmpty(),
    body('totalSeats').isInt({ min: 1 })
], adminController.addTrain);

router.put('/trains/:id', [
    body('totalSeats').optional().isInt({ min: 1 }),
], adminController.updateTrain);

module.exports = router;