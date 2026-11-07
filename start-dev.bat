@echo off
title Fayz Cafe Mini App - Dev Server
cd /d "%~dp0"
set "PATH=%~dp0.toolchain;%PATH%"
echo ===================================================
echo     FAYZA CAFE - TELEGRAM MINI APP (DEV SERVER)
echo ===================================================
echo Brauzerda ochish: http://localhost:3000
echo.
npm run dev
pause
