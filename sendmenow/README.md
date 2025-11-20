# SendMeNow Project

This project includes a React frontend and Node.js/Express backend with MySQL database integration.

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Setup Backend Server

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

### 3. Configure Database

1. Create a `.env` file in the `server` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=sendmenow_db
DB_PORT=3306
PORT=5000
```

2. Create the database and table by running the SQL script:

```bash
mysql -u root -p < database.sql
```

Or manually execute the SQL commands in `server/database.sql` using MySQL Workbench or command line.

### 4. Start the Application

**Option 1: Run Both Together (Recommended)**
```bash
npm run dev
```

This will start both the backend server and React frontend simultaneously.

**Option 2: Run Separately**

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm start
```

The backend server will run on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
sendmenow/
├── server/              # Backend server
│   ├── server.js        # Express server and API routes
│   ├── database.sql     # Database schema
│   ├── package.json     # Backend dependencies
│   └── README.md        # Backend setup guide
├── src/                 # React frontend
│   ├── App.js          # Main component with form
│   └── App.css         # Styles
└── package.json        # Frontend dependencies
```

## API Endpoints

- `POST /api/users` - Register a new user
  - Body: `{ userName, userEmail, userPassword }`
  - Returns: `{ success: true, message: 'User registered successfully', userId: <id> }`

- `GET /api/health` - Health check endpoint

## Features

- User registration form with validation
- MySQL database integration
- Real-time form submission feedback
- Error handling and user notifications

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
