@echo off
title Faiza Cafe - GitHub Push
cd /d "%~dp0"
echo ===================================================
echo     FAIZA CAFE - GITHUB REPO'GA YUKLASH
echo     Repo: https://github.com/ShukurullohMamadaliyev/Faiza-cafe.git
echo ===================================================
echo.
echo 1. Git holati tekshirilmoqda...
git status
echo.
echo 2. Main tarmog'iga push qilinmoqda...
echo (Agar oyna chiqsa, "Sign in with your browser" tugmasini bosing)
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo     MUVAFFAQAYATLI YUKLANDI! (GITHUB: OK)
    echo ===================================================
) else (
    echo.
    echo Xatolik yuz berdi. Agar token so'rasa, GitHub Personal Access Token kiriting.
)
pause
