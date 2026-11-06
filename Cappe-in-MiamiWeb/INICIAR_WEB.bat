@echo off
cd /d "%~dp0"
node iniciar-web.cjs
if errorlevel 1 pause
