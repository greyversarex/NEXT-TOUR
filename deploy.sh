#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

SKIP_DB=false
for arg in "$@"; do
  [[ "$arg" == "--skip-db" ]] && SKIP_DB=true
done

step() {
  echo -e "\n${CYAN}▶ $1${RESET}"
}

ok() {
  echo -e "${GREEN}✓ $1${RESET}"
}

fail() {
  echo -e "${RED}✗ Ошибка на шаге: $1${RESET}"
  exit 1
}

echo -e "${YELLOW}"
echo "╔══════════════════════════════════════╗"
echo "║        NEXT TOUR  —  DEPLOY          ║"
echo "║  $(date '+%Y-%m-%d %H:%M:%S')               ║"
echo "╚══════════════════════════════════════╝"
echo -e "${RESET}"

step "1/4  git pull origin main"
git pull origin main || fail "git pull"
ok "Исходный код обновлён"

step "2/4  npm install"
npm install || fail "npm install"
ok "Зависимости установлены"

step "3/4  npm run build"
npm run build || fail "npm run build"
ok "Проект собран"

if [ "$SKIP_DB" = true ]; then
  echo -e "\n${YELLOW}⚠  Синхронизация БД пропущена (--skip-db).${RESET}"
else
  step "4/4  Синхронизация схемы БД"
  npm run db:push || fail "npm run db:push"
  ok "Схема базы данных синхронизирована"
fi

step "Создание директории для загрузок"
mkdir -p uploads
ok "Директория uploads готова"

step "Перезапуск сервера"
pm2 delete nexttour 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production || fail "pm2 start"
pm2 save
ok "Сервер перезапущен (PORT=3000)"

echo -e "\n${GREEN}══════════════════════════════════════"
echo -e "  Деплой завершён успешно"
echo -e "  $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "══════════════════════════════════════${RESET}\n"
