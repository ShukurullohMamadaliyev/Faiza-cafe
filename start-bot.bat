@echo off
title Faiza Cafe Telegram Bot
cd /d "%~dp0"
set "PATH=%~dp0.toolchain;%PATH%"
echo ===================================================
echo     FAIZA CAFE - TELEGRAM BOT ISHGA TUSHMOQDA
echo     Bot: @faizacafe_rishton_bot
echo ===================================================
echo.
node bot.js
pause
