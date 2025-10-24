@echo off
echo Starting MERN Agent Management System...
echo.

echo Step 1: Seeding admin user...
node backend/scripts/seedAdmin.js

echo.
echo Step 2: Starting the application...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.
echo Login credentials:
echo Email: admin@example.com
echo Password: password123
echo.

npm run dev