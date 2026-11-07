@echo off
title Fayz Cafe Mini App - Live Server
cd /d "%~dp0"
echo ===================================================
echo     FAYZA CAFE - PRODUCTION LIVE SERVER
echo ===================================================
echo Brauzerda ochish: http://localhost:3000
echo.
python -m http.server 3000 --directory dist
pause
