#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

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

step "1/5  git pull origin main"
git pull origin main || fail "git pull"
ok "Код обновлён"

step "2/5  npm install"
npm install || fail "npm install"
ok "Зависимости установлены"

step "3/5  npm run build"
npm run build || fail "npm run build"
ok "Проект собран"

step "4/5  npm run db:push"
npm run db:push || fail "npm run db:push"
ok "База данных синхронизирована"

step "5/5  pm2 restart nexttour"
pm2 restart nexttour || fail "pm2 restart"
ok "Сервер перезапущен"

echo -e "\n${GREEN}══════════════════════════════════════"
echo -e "  Деплой завершён успешно"
echo -e "  $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "══════════════════════════════════════${RESET}\n"
