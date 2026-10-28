@echo off
setlocal
cd /d "%~dp0"
echo ========================================
echo        Study Sync - First Run
echo ========================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install the LTS version from https://nodejs.org/ then reopen this file.
  pause
  exit /b 1
)
if not exist package.json (
  echo package.json is missing. Extract the ZIP completely and run this file from the extracted folder.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing project dependencies. This can take a few minutes...
  call npm install
  if errorlevel 1 goto failed
)
echo.
echo Starting Study Sync...
echo Keep this window open while using the website.
echo Open http://localhost:5173/ if the browser does not open automatically.
call npm run dev -- --open
if errorlevel 1 goto failed
exit /b 0
:failed
echo.
echo Setup failed. Check the error above, then share a screenshot.
pause
exit /b 1
