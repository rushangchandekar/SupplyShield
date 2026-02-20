@echo off
cd /d "c:\Users\Rushang\Desktop\SB Jain\supply-chain-risk\frontend"
echo Starting npm install...
call npm install
echo NPM install complete. Exit code: %ERRORLEVEL%
echo ---
dir /b node_modules 2>nul | find /c /v "" 
echo packages installed
pause
