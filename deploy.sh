#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

SKIP_DB=false
for arg in "$@"; do
  [[ "$arg" == "--skip-db" ]] && SKIP_DB=true
done

step() { echo -e "\n${CYAN}▶ $1${RESET}"; }
ok()   { echo -e "${GREEN}✓ $1${RESET}"; }
fail() { echo -e "${RED}✗ Ошибка: $1${RESET}"; exit 1; }

echo -e "${YELLOW}"
echo "╔══════════════════════════════════════╗"
echo "║        NEXT TOUR  —  DEPLOY          ║"
echo "║  $(date '+%Y-%m-%d %H:%M:%S')               ║"
echo "╚══════════════════════════════════════╝"
echo -e "${RESET}"

step "0/5  Загрузка переменных окружения"
if [ -f "$DIR/.env" ]; then
  set -a
  source "$DIR/.env"
  set +a
  ok ".env загружен"
else
  fail "Файл .env не найден в $DIR"
fi

step "1/5  git pull origin main"
git pull origin main || fail "git pull"
ok "Исходный код обновлён"

step "2/5  npm install"
npm install --include=dev || fail "npm install"
ok "Зависимости установлены (включая devDependencies)"

step "3/5  npm run build"
export PATH="$DIR/node_modules/.bin:$PATH"
npm run build || fail "npm run build"
ok "Проект собран"

if [ "$SKIP_DB" = true ]; then
  echo -e "\n${YELLOW}⚠  Синхронизация БД пропущена (--skip-db)${RESET}"
else
  step "4/5  Синхронизация схемы БД"
  npx drizzle-kit push || fail "db:push"
  ok "Схема базы данных синхронизирована"
fi

step "5/5  Перезапуск сервера"
mkdir -p uploads
pm2 delete nexttour 2>/dev/null || true
pm2 start ecosystem.config.cjs || fail "pm2 start"
pm2 save
ok "Сервер запущен (PORT=${PORT:-3000})"

sleep 2
if pm2 show nexttour | grep -q "online"; then
  echo -e "\n${GREEN}══════════════════════════════════════"
  echo "  ✅ Деплой завершён успешно"
  echo "  $(date '+%Y-%m-%d %H:%M:%S')"
  echo -e "══════════════════════════════════════${RESET}\n"
else
  echo -e "\n${RED}══════════════════════════════════════"
  echo "  ⚠️  PM2 запустился, но статус не online."
  echo "  Проверь логи: pm2 logs nexttour --lines 30"
  echo -e "══════════════════════════════════════${RESET}\n"
  exit 1
fi
