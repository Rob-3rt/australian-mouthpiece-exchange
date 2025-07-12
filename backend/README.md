# The Australian Mouthpiece Exchange Backend

## Features
- User registration, login, email verification
- User profiles
- Listings CRUD
- Peer rating system
- Messaging
- Moderation and admin dashboard

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Set up your `.env` file:**
   - See `.env.example` for required variables (DATABASE_URL, JWT_SECRET, SMTP, etc.)
3. **Run database migrations:**
   ```sh
   npx prisma migrate dev
   ```
4. **Start the server:**
   ```sh
   npm run dev
   # or
   npm start
   ```

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - For email verification

## API Endpoints
- `/api/auth` - Registration, login, email verification
- `/api/profile` - User profile management
- `/api/listings` - Listings CRUD
- `/api/ratings` - Peer ratings
- `/api/messages` - Messaging
- `/api/moderation` - Flagging and admin moderation

## Development
- Uses [Prisma](https://www.prisma.io/) for ORM
- Uses [Express](https://expressjs.com/) for API
- Uses [Nodemailer](https://nodemailer.com/) for email

---

For questions or contributions, open an issue or pull request. 