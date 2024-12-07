const request = require('supertest');
const app = require('../src/index');
const { sequelize } = require('../src/config/database');
const Train = require('../src/models/train');
const User = require('../src/models/user');
const Booking = require('../src/models/booking');

describe('Booking Tests', () => {
  let userToken;
  let trainId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create user
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    // Get user token
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    userToken = login.body.token;

    // Create test train
    const train = await Train.create({
      trainNumber: '12345',
      source: 'Mumbai',
      destination: 'Delhi',
      totalSeats: 2,
      availableSeats: 2
    });
    trainId = train.id;
  });

  beforeEach(async () => {
    await Booking.destroy({ where: {} });
    await Train.update({ availableSeats: 2 }, { where: { id: trainId } });
  });

  describe('GET /api/booking/trains', () => {
    it('should get available trains', async () => {
      const res = await request(app)
        .get('/api/booking/trains')
        .query({
          source: 'Mumbai',
          destination: 'Delhi'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/booking/book', () => {
    it('should book a seat successfully', async () => {
      const res = await request(app)
        .post('/api/booking/book')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          trainId: trainId
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('seatNumber');
    });

    it('should handle concurrent booking requests correctly', async () => {
      // Make 3 concurrent booking requests (train has only 2 seats)
      const bookingPromises = Array(3).fill().map(() =>
        request(app)
          .post('/api/booking/book')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            trainId: trainId
          })
      );

      const results = await Promise.all(bookingPromises);
      
      // Count successful bookings
      const successfulBookings = results.filter(res => res.statusCode === 200);
      expect(successfulBookings.length).toBe(2); // Only 2 should succeed
    });
  });

  describe('GET /api/booking/:id', () => {
    let bookingId;

    beforeEach(async () => {
      const booking = await request(app)
        .post('/api/booking/book')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          trainId: trainId
        });
      bookingId = booking.body.id;
    });

    it('should get booking details successfully', async () => {
      const res = await request(app)
        .get(`/api/booking/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', bookingId);
    });
  });
});