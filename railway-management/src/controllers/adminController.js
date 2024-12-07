const { validationResult } = require('express-validator');
const Train = require('../models/train');

const adminController = {
    async addTrain(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { trainNumber, source, destination, totalSeats } = req.body;

            // Check if train already exists
            const existingTrain = await Train.findOne({
                where: { trainNumber }
            });

            if (existingTrain) {
                return res.status(400).json({ error: 'Train already exists' });
            }

            // Create new train
            const train = await Train.create({
                trainNumber,
                source,
                destination,
                totalSeats,
                availableSeats: totalSeats // Initially all seats are available
            });

            res.status(201).json({
                message: 'Train added successfully',
                train
            });
        } catch (error) {
            console.error('Add train error:', error);
            res.status(500).json({ error: 'Error adding train' });
        }
    },

    async updateTrain(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const updateData = req.body;

            const train = await Train.findByPk(id);
            if (!train) {
                return res.status(404).json({ error: 'Train not found' });
            }

            // If updating total seats, adjust available seats accordingly
            if (updateData.totalSeats) {
                const seatsDifference = updateData.totalSeats - train.totalSeats;
                updateData.availableSeats = train.availableSeats + seatsDifference;
            }

            await train.update(updateData);

            res.json({
                message: 'Train updated successfully',
                train
            });
        } catch (error) {
            console.error('Update train error:', error);
            res.status(500).json({ error: 'Error updating train' });
        }
    }
};

module.exports = adminController;
