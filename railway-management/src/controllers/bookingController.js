const { sequelize } = require('../config/database');
const Train = require('../models/train');
const Booking = require('../models/booking');

const bookingController = {
  // Get available trains between source and destination
  async getAvailableTrains(req, res) {
    try {
      const { source, destination } = req.query;
      
      const trains = await Train.findAll({
        where: {
          source,
          destination,
          availableSeats: {
            [Op.gt]: 0
          }
        }
      });
      
      res.json(trains);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching available trains' });
    }
  },

  // Book a seat with transaction and locking
  async bookSeat(req, res) {
    const t = await sequelize.transaction();
    
    try {
      const { trainId } = req.body;
      const userId = req.user.id;

      // Lock the train record for update
      const train = await Train.findByPk(trainId, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!train || train.availableSeats <= 0) {
        await t.rollback();
        return res.status(400).json({ error: 'No seats available' });
      }

      // Create booking and update seat count atomically
      const booking = await Booking.create({
        userId,
        trainId,
        seatNumber: train.totalSeats - train.availableSeats + 1
      }, { transaction: t });

      await train.decrement('availableSeats', { transaction: t });
      
      await t.commit();
      res.json(booking);
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: 'Error booking seat' });
    }
  },

  // Get specific booking details
  async getBookingDetails(req, res) {
    try {
      const booking = await Booking.findByPk(req.params.bookingId, {
        include: [
          { model: Train, attributes: ['trainNumber', 'source', 'destination'] }
        ]
      });

      if (!booking || booking.userId !== req.user.id) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching booking details' });
    }
  }
};

module.exports = bookingController;