@echo off
echo ========================================
echo    DATABASE & XAMPP STATUS TEST
echo ========================================
echo.

echo [1] Testing XAMPP Status...
node test-xampp-status.js
echo.
pause

echo [2] Testing MySQL Direct Connection...
node test-mysql-direct.js
echo.
pause

echo [3] Testing Database Connection with mysql2...
node test-database-connection.js
echo.
pause

echo ========================================
echo    TEST COMPLETED
echo ========================================
echo.
echo Check the results above to diagnose issues.
echo.
pause
