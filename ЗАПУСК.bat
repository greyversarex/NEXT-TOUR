@echo off
chcp 65001 >nul
title NEXT-TOUR - локальный запуск
cd /d "%~dp0"

echo ============================================
echo   Запуск сайта NEXT-TOUR
echo ============================================
echo.

REM --- 1. Проверяем, запущен ли Docker ---
echo [1/4] Проверяю Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo      Docker не запущен. Запускаю Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo      Жду запуска Docker (это может занять до минуты)...
    :waitdocker
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if errorlevel 1 goto waitdocker
)
echo      Docker готов.
echo.

REM --- 2. Запускаем контейнер с базой данных ---
echo [2/4] Запускаю базу данных...
docker start nexttour-db >nul 2>&1
if errorlevel 1 (
    echo      Контейнер не найден, создаю новый...
    docker run -d --name nexttour-db -e POSTGRES_PASSWORD=nexttour -e POSTGRES_DB=nexttour -p 5433:5432 postgres:17 >nul
)
echo      База данных работает.
echo.

REM --- 3. Ждём готовности базы ---
echo [3/4] Жду готовности базы данных...
timeout /t 5 /nobreak >nul
echo      Готово.
echo.

REM --- 4. Запускаем сервер ---
echo [4/4] Запускаю сайт...
echo.
echo ============================================
echo   Сайт открывается: http://localhost:5000
echo   (откроется в браузере через несколько секунд)
echo.
echo   Чтобы остановить сайт - закройте это окно
echo   или нажмите Ctrl+C
echo ============================================
echo.

REM Открываем браузер с небольшой задержкой в отдельном процессе
start "" cmd /c "timeout /t 6 /nobreak >nul & start http://localhost:5000"

npx tsx server/index.ts

pause
