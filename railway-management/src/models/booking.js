const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  trainId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  seatNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bookingDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'cancelled'),
    defaultValue: 'confirmed'
  }
});

// Establish relationships
const User = require('./user');
const Train = require('./train');

Booking.belongsTo(User);
Booking.belongsTo(Train);
User.hasMany(Booking);
Train.hasMany(Booking);

module.exports = Booking;
