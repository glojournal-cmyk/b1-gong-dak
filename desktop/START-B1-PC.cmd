@echo off
setlocal
cd /d "%~dp0.."
where py >nul 2>nul
if errorlevel 1 (
  echo Python 3 launcher not found. Please install Python 3 from https://www.python.org/downloads/windows/
  echo Then double-click this START-B1-PC.cmd file again.
  pause
  exit /b 1
)
echo Starting B1 Gong Dak local AI coach...
echo Note: Install and run Ollama first. One-time model command: ollama pull qwen3:1.7b
py -3 desktop\server.py
if errorlevel 1 (
  echo Could not start the local test server. Is port 8765 already in use?
  pause
)