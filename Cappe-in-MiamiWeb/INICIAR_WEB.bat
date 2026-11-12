@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js nao encontrado. Instale o Node.js LTS em https://nodejs.org/ e abra este arquivo novamente.
  pause
  exit /b 1
)
node iniciar-web.cjs
if errorlevel 1 pause
