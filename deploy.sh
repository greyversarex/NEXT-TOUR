#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

# По умолчанию схема синхронизируется всегда.
# Передай --skip-db чтобы пропустить синхронизацию базы (только если 100% уверен что схема не менялась).
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
ok "Код обновлён"

step "2/4  npm install"
npm install || fail "npm install"
ok "Зависимости установлены"

step "3/4  npm run build"
# NODE_OPTIONS увеличивает heap Node.js до 1GB — необходимо для больших бандлов
export NODE_OPTIONS="--max-old-space-size=1024"
npm run build 2>&1 || fail "npm run build"
ok "Проект собран"

if [ "$SKIP_DB" = true ]; then
  echo -e "\n${YELLOW}⚠  Синхронизация БД пропущена (--skip-db).${RESET}"
  echo -e "${YELLOW}   Убедись что схема не менялась с прошлого деплоя!${RESET}"
else
  step "4/4  Синхронизация схемы БД"
  npm run db:push || fail "npm run db:push"
  ok "Схема базы данных синхронизирована"
fi

step "Перезапуск сервера"
pm2 restart nexttour || fail "pm2 restart"
ok "Сервер перезапущен"

echo -e "\n${GREEN}══════════════════════════════════════"
echo -e "  Деплой завершён успешно"
echo -e "  $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "══════════════════════════════════════${RESET}\n"
