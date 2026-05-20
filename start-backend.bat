@echo off
cd /d "%~dp0backend"

echo Using Python 3.10...
py -3.10 --version 2>nul || (echo ERROR: Python 3.10 not found && pause && exit /b 1)

rem Delete broken venv if activate.bat is missing
if exist ".venv" (
    if not exist ".venv\Scripts\activate.bat" (
        echo Removing broken venv...
        rmdir /s /q .venv
    )
)

rem Create venv if it doesn't exist
if not exist ".venv" (
    echo Creating Python 3.10 virtual environment...
    py -3.10 -m venv .venv
)

call .venv\Scripts\activate.bat

echo Upgrading pip...
python -m pip install --upgrade pip -q 2>nul

echo Installing backend dependencies...
pip install -r requirements.txt -q

echo.
echo Backend running at http://localhost:8000
echo.
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
