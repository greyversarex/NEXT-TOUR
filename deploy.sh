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
# Этот VPS слаб для сборки Vite (падает с OOM ~489 МБ), поэтому по умолчанию
# сервер НЕ собирает проект, а использует готовый dist/, собранный на Replit
# и закоммиченный в репозиторий. Флаг --build включает сборку прямо на сервере
# (имеет смысл только если на сервере добавлен swap).
BUILD_ON_SERVER=false
for arg in "$@"; do
  [[ "$arg" == "--skip-db" ]] && SKIP_DB=true
  [[ "$arg" == "--build" ]] && BUILD_ON_SERVER=true
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

if [ "$BUILD_ON_SERVER" = true ]; then
  step "3/5  npm run build (на сервере)"
  export PATH="$DIR/node_modules/.bin:$PATH"
  # Поднимаем лимит кучи Node только для сборки, иначе на сервере с малым
  # объёмом RAM сборка Vite падает с "JavaScript heap out of memory".
  # Переменная задаётся inline и не утекает в pm2/рантайм-процесс сервера.
  NODE_OPTIONS="--max-old-space-size=2048" npm run build || fail "npm run build"
  ok "Проект собран на сервере"
else
  step "3/5  Готовый билд из репозитория"
  # Сборку делаем на Replit и коммитим dist/ в репозиторий — этот сервер
  # слишком слаб для Vite. git checkout восстанавливает dist/ из коммита
  # на случай, если прошлая попытка сборки на сервере удалила/повредила его.
  git checkout -- dist 2>/dev/null || true
  [ -f dist/index.cjs ] || fail "dist/index.cjs не найден. Соберите на Replit (npm run build) и запушьте, либо запустите ./deploy.sh --build"
  ok "Используется готовый dist/ из репозитория"
fi

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
