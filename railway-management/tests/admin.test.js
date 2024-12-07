const request = require('supertest');
const app = require('../src/index');
const { sequelize } = require('../src/config/database');
const Train = require('../src/models/train');
const User = require('../src/models/user');

describe('Admin Tests', () => {
  let adminToken;
  let regularUserToken;
  const adminApiKey = process.env.ADMIN_API_KEY;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: true
    });

    // Create regular user
    const regularUser = await User.create({
      username: 'user',
      email: 'user@example.com',
      password: 'user123'
    });

    // Get tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'user123' });
    regularUserToken = userLogin.body.token;
  });

  beforeEach(async () => {
    await Train.destroy({ where: {} });
  });

  describe('POST /api/admin/trains', () => {
    it('should add a new train when admin authenticated', async () => {
      const res = await request(app)
        .post('/api/admin/trains')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-API-KEY', adminApiKey)
        .send({
          trainNumber: '12345',
          source: 'Mumbai',
          destination: 'Delhi',
          totalSeats: 100
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.train).toHaveProperty('trainNumber', '12345');
    });

    it('should fail when regular user tries to add train', async () => {
      const res = await request(app)
        .post('/api/admin/trains')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .set('X-API-KEY', adminApiKey)
        .send({
          trainNumber: '12345',
          source: 'Mumbai',
          destination: 'Delhi',
          totalSeats: 100
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/admin/trains/:id', () => {
    let trainId;

    beforeEach(async () => {
      const train = await Train.create({
        trainNumber: '12345',
        source: 'Mumbai',
        destination: 'Delhi',
        totalSeats: 100,
        availableSeats: 100
      });
      trainId = train.id;
    });

    it('should update train successfully as admin', async () => {
      const res = await request(app)
        .put(`/api/admin/trains/${trainId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-API-KEY', adminApiKey)
        .send({
          totalSeats: 150
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.train.totalSeats).toBe(150);
    });
  });
});
