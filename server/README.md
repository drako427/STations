# STATIONS Backend - README

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your MySQL credentials:

```bash
cp .env.example .env
```

Edit `.env` and update the following:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=stations_db
```

### 3. Test Database Connection

Run the database configuration test:

```bash
npm test
```

You should see:
```
✅ Database connection established successfully
📊 Connected to: stations_db on localhost:3306
✅ Test query executed successfully
✅ Database connection pool closed
✅ Database configuration test completed successfully
```

### 4. Verify Setup

The backend is now ready for API endpoint development.

## Project Structure

```
server/
├── config/
│   └── database.js      # MySQL connection pool
├── .env.example         # Environment template
├── .env                 # Your credentials (gitignored)
├── package.json         # Dependencies
└── README.md           # This file
```

## Dependencies

- **mysql2** (v3.11.5): MySQL client with Promise support
- **dotenv** (v16.4.7): Environment variable management

## Next Steps

- Create API routes
- Implement authentication
- Build CRUD endpoints for stations, users, suspects, and cases
