@echo off
cd /d "%~dp0"
node iniciar-wasm.cjs
if errorlevel 1 pause
