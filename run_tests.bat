@echo off
echo ========================================================
echo Starting Ente KSRTC Automated Testing System
echo ========================================================

cd tests

echo.
echo ========================================================
echo Running Backend Unit and Integration Tests (Jest)...
echo ========================================================
set NODE_OPTIONS=--experimental-vm-modules
call npx jest --config jest.config.js --coverage
set JEST_EXIT_CODE=%ERRORLEVEL%

echo.
echo ========================================================
echo Running Frontend Component Tests (Vitest)...
echo ========================================================
call npx vitest run --config vitest.config.js --coverage
set VITEST_EXIT_CODE=%ERRORLEVEL%

echo.
echo ========================================================
echo Testing System Summary
echo ========================================================

if %JEST_EXIT_CODE% NEQ 0 (
    echo [ERROR] Backend tests failed.
) else (
    echo [SUCCESS] Backend tests passed.
)

if %VITEST_EXIT_CODE% NEQ 0 (
    echo [ERROR] Frontend tests failed.
) else (
    echo [SUCCESS] Frontend tests passed.
)

if %JEST_EXIT_CODE% NEQ 0 exit /b %JEST_EXIT_CODE%
if %VITEST_EXIT_CODE% NEQ 0 exit /b %VITEST_EXIT_CODE%

echo.
echo [SUCCESS] All full-stack tests passed successfully!
exit /b 0
