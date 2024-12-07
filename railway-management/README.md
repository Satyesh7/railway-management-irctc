# Railway Management System API

This is a Node.js backend API for a railway management system similar to IRCTC, allowing users to check train availability and book seats.

## Features

- User registration and authentication
- Admin operations for managing trains
- Real-time seat availability checking
- Concurrent seat booking with race condition handling
- Role-based access control
- JWT-based authentication
- API key protection for admin endpoints

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm (Node Package Manager)

## Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/Satyesh7/railway-management-irctc.git
cd railway-management
```

2. Install dependencies
```bash
npm install
```

3. Create a PostgreSQL database

4. Configure environment variables:
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=postgresql://user:password@localhost:5432/railway_db
JWT_SECRET=your-jwt-secret-here
ADMIN_API_KEY=your-admin-api-key-here
PORT=3000
```

5. Run database migrations
```bash
npm run migrate
```

6. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Admin Operations (Requires API Key)
- `POST /api/admin/trains` - Add a new train
- `PUT /api/admin/trains/:id` - Update train details

### User Operations
- `GET /api/booking/trains` - Get available trains
- `POST /api/booking/book` - Book a seat (requires authentication)
- `GET /api/booking/:id` - Get booking details (requires authentication)

## API Documentation

### Authentication Headers
- For protected routes: `Authorization: Bearer <jwt_token>`
- For admin routes: `X-API-KEY: <admin_api_key>`

### Request/Response Examples

1. Register User
```json
POST /api/auth/register
{
  "username": "user1",
  "email": "user1@example.com",
  "password": "password123"
}
```

2. Add Train (Admin)
```json
POST /api/admin/trains
{
  "trainNumber": "12345",
  "source": "Mumbai",
  "destination": "Delhi",
  "totalSeats": 100
}
```

3. Book Seat
```json
POST /api/booking/book
{
  "trainId": 1
}
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Race Condition Handling

The application handles concurrent booking requests using database transactions and row-level locking to ensure that:
- No seat is double-booked
- Seat availability is accurately maintained
- Only one user can successfully book a specific seat

## Testing

Run the test suite:
```bash
npm test
```

## Assumptions

1. Each train has a fixed number of seats
2. Seats are numbered sequentially from 1 to totalSeats
3. Admin API key is managed outside the application
4. JWT tokens expire after 24 hours

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
