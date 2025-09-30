@echo off
title Iniciando servidor Next.js

REM --- Abrir servidor Next.js ---
start cmd /k "cd C:\Users\jaime\iCloudDrive\mentana && npm run dev"

echo Servidores iniciados. Esta ventana se cierra en 5 segundos...
timeout /t 5 /nobreak >nul
exit
