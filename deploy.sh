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

step "1/5  git pull origin main"
git pull origin main || fail "git pull"
ok "Код обновлён"

step "2/5  npm install"
npm install || fail "npm install"
ok "Зависимости установлены"

# Сборка разбита на два отдельных процесса:
# — клиент (Vite) — тяжёлый, требует много RAM → получает до 4 GB
# — сервер (esbuild) — лёгкий → запускается после, с чистой памятью
# Раздельные процессы важны: после Vite Node.js освобождает всю heap перед запуском esbuild.

step "3/5  Сборка клиента (Vite)"
# NODE_ENV=production: включает production-режим Vite (меньше overhead)
# --max-old-space-size=1536: лимит heap JS. На сервере с 2 GB это оставляет ~500 MB
# для ОС и других процессов. Node.js агрессивно GC-ит до достижения лимита —
# пик потребления памяти гораздо ниже чем при 4096 (который вызывает OOM-kill от ядра).
NODE_ENV=production NODE_OPTIONS="--max-old-space-size=1536" npx tsx script/build-client.ts 2>&1 || fail "Vite build"
ok "Клиент собран"

step "4/5  Сборка сервера (esbuild)"
NODE_ENV=production NODE_OPTIONS="--max-old-space-size=512" npx tsx script/build-server.ts 2>&1 || fail "esbuild"
ok "Сервер собран"

if [ "$SKIP_DB" = true ]; then
  echo -e "\n${YELLOW}⚠  Синхронизация БД пропущена (--skip-db).${RESET}"
  echo -e "${YELLOW}   Убедись что схема не менялась с прошлого деплоя!${RESET}"
else
  step "5/5  Синхронизация схемы БД"
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
