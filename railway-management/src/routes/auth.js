const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', [
    body('username').notEmpty().trim(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
], authController.register);

router.post('/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], authController.login);

module.exports = router;