@echo off
echo Setting up MERN Agent Management System...
echo.

echo Step 1: Installing backend dependencies...
npm install

echo.
echo Step 2: Installing frontend dependencies...
cd frontend
npm install
cd ..

echo.
echo Step 3: Creating admin user...
node backend/scripts/seedAdmin.js

echo.
echo Setup complete! You can now run the application with:
echo npm run dev
echo.
echo Or use the start.bat file for convenience.
echo.
pause