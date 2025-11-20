# Backend Server Setup

## Prerequisites
- Node.js installed
- MySQL database server running

## Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Create a `.env` file in the server directory with your database configuration:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=sendmenow_db
DB_PORT=3306
PORT=5000
```

3. Create the database and table:
   - Open MySQL command line or MySQL Workbench
   - Run the SQL commands from `database.sql`:
   ```bash
   mysql -u root -p < database.sql
   ```
   Or copy and paste the contents of `database.sql` into your MySQL client

## Running the Server

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

- `POST /api/users` - Register a new user
  - Body: `{ userName, userEmail, userPassword }`
  - Returns: `{ success: true, message: 'User registered successfully', userId: <id> }`

- `GET /api/health` - Health check endpoint

