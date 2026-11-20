#!/usr/bin/env bash
# Isolated Potion stack for verification: own Postgres and Redis containers,
# own Next dev server and Yjs server on free ports, own auth secret.
# Usage: potion-stack.sh up|doctor|login [name]|env|down
# VERIFY_POTION names the Potion checkout; it defaults to the current directory.
set -euo pipefail

SCRIPT="$0"
POTION="${VERIFY_POTION:-$PWD}"
ROOT="$(git -C "$POTION" rev-parse --show-toplevel 2>/dev/null)" || {
  echo "$POTION is not inside a git checkout" >&2
  exit 1
}
if [ ! -f "$ROOT/src/server/yjs/server.ts" ] || [ ! -d "$ROOT/prisma" ]; then
  echo "$ROOT is not a Potion checkout (no src/server/yjs/server.ts or prisma/)" >&2
  exit 1
fi
cd "$ROOT"
STATE_DIR="$ROOT/tmp/verify"
STATE="$STATE_DIR/stack.env"
LOGS="$STATE_DIR/logs"

PG_PORT="${VERIFY_PG_PORT:-56432}"
REDIS_PORT="${VERIFY_REDIS_PORT:-56379}"
APP_PORT="${VERIFY_APP_PORT:-3100}"
YJS_PORT="${VERIFY_YJS_PORT:-4544}"
PG_NAME="${VERIFY_PG_NAME:-potion-verify-pg}"
REDIS_NAME="${VERIFY_REDIS_NAME:-potion-verify-redis}"

listening() { lsof -nP -iTCP:"$1" -sTCP:LISTEN -t 2>/dev/null | head -1; }

load() {
  [ -f "$STATE" ] || { echo "no stack in $ROOT: run '$SCRIPT up' first" >&2; exit 1; }
  # shellcheck disable=SC1090
  . "$STATE"
}

# The app runs on 127.0.0.1, not localhost: browsers share localhost cookies
# across ports, so another local app's httpOnly better-auth cookie shadows ours.
# Exports the overrides; dotenv-cli and Next both keep existing process env, so
# .env.local only fills the rest (AI keys). Uploads land on disk under tmp/verify/files.
exports() {
  cat <<EOF
export DATABASE_URL=postgresql://verify:verify@127.0.0.1:$PG_PORT/potion?schema=public
export BETTER_AUTH_SECRET=$SECRET
export PORT=$APP_PORT
export NEXT_PUBLIC_SITE_URL=http://127.0.0.1:$APP_PORT
export NEXT_PUBLIC_YJS_URL=ws://127.0.0.1:$YJS_PORT/yjs
export YJS_PORT=$YJS_PORT
export YJS_HOST=127.0.0.1
export YJS_INTERNAL_URL=http://127.0.0.1:$YJS_PORT
export REDIS_HOST=127.0.0.1
export REDIS_PORT=$REDIS_PORT
export UPSTASH_REDIS_REST_TOKEN=
export UPSTASH_REDIS_REST_URL=
export FILES_STORAGE=fs
export FILES_FS_ROOT=$STATE_DIR/files
export FILES_API_SECRET=$SECRET
export FILES_MAX_UPLOAD_SIZE=16777216
EOF
}

# Starts a command in its own process group so `down` can kill the whole tree.
spawn() {
  local log="$1"
  shift
  (set -m; nohup "$@" >"$log" 2>&1 & echo $!)
}

wait_for() {
  local label="$1" tries="$2"
  shift 2
  for _ in $(seq "$tries"); do
    if "$@" >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  echo "timed out waiting for $label" >&2
  return 1
}

up() {
  if [ -f "$STATE" ]; then
    echo "stack state exists at $STATE; run '$SCRIPT doctor' or '$SCRIPT down' first" >&2
    exit 1
  fi
  if [ -f .next/dev/lock ] && lsof .next/dev/lock >/dev/null 2>&1; then
    echo "another 'next dev' runs in this checkout; refusing to start a second one" >&2
    exit 1
  fi
  for port in "$PG_PORT" "$REDIS_PORT" "$APP_PORT" "$YJS_PORT"; do
    if [ -n "$(listening "$port")" ]; then
      echo "port $port is taken; set VERIFY_*_PORT to free ports" >&2
      exit 1
    fi
  done
  mkdir -p "$LOGS"
  SECRET="$(openssl rand -base64 32)"

  docker run -d --rm --name "$PG_NAME" -e POSTGRES_USER=verify -e POSTGRES_PASSWORD=verify \
    -e POSTGRES_DB=potion -p "127.0.0.1:$PG_PORT:5432" postgres:17-alpine >/dev/null
  docker run -d --rm --name "$REDIS_NAME" -p "127.0.0.1:$REDIS_PORT:6379" redis:7-alpine >/dev/null
  # pg_isready passes while init scripts still run; a query over TCP does not.
  wait_for postgres 60 docker exec "$PG_NAME" psql -h 127.0.0.1 -U verify -d potion -c 'select 1'
  wait_for redis 30 docker exec "$REDIS_NAME" redis-cli ping

  eval "$(exports)"
  bun x prisma migrate deploy >"$LOGS/migrate.log" 2>&1 || { cat "$LOGS/migrate.log" >&2; exit 1; }

  YJS_PID="$(spawn "$LOGS/yjs.log" bun x dotenv -e .env.local -- bun --conditions=production src/server/yjs/server.ts)"
  # The v54 editor's module graph runs next dev past Node's default heap on
  # the first document page compile.
  APP_PID="$(spawn "$LOGS/next.log" env NODE_OPTIONS="--max-old-space-size=${VERIFY_NEXT_HEAP_MB:-8192} ${NODE_OPTIONS:-}" bun x dotenv -e .env.local -- bun x next dev --port "$APP_PORT")"
  {
    echo "PG_PORT=$PG_PORT REDIS_PORT=$REDIS_PORT APP_PORT=$APP_PORT YJS_PORT=$YJS_PORT"
    echo "PG_NAME=$PG_NAME REDIS_NAME=$REDIS_NAME"
    echo "SECRET='$SECRET'"
    echo "APP_PID=$APP_PID YJS_PID=$YJS_PID"
  } >"$STATE"

  wait_for yjs 60 sh -c "[ -n \"\$(lsof -nP -iTCP:$YJS_PORT -sTCP:LISTEN -t)\" ]"
  # First compile of /login takes a while; ready means it renders.
  wait_for next 240 curl -sf -o /dev/null "http://127.0.0.1:$APP_PORT/login"
  echo "ready: http://127.0.0.1:$APP_PORT (logs in $LOGS)"
}

doctor() {
  load
  local ok=0
  check() {
    if "${@:2}" >/dev/null 2>&1; then echo "ok   $1"; else echo "FAIL $1"; ok=1; fi
  }
  check "postgres container answers" docker exec "$PG_NAME" psql -h 127.0.0.1 -U verify -d potion -c 'select 1'
  check "redis container answers" docker exec "$REDIS_NAME" redis-cli ping
  check "migrations applied" docker exec "$PG_NAME" psql -U verify -d potion -tAc 'select 1 from "_prisma_migrations" limit 1'
  check "next dev (pgid $APP_PID) alive" kill -0 "$APP_PID"
  check "yjs (pgid $YJS_PID) alive" kill -0 "$YJS_PID"
  check "port $APP_PORT owned by our next" sh -c "ps -o pgid= -p \$(lsof -nP -iTCP:$APP_PORT -sTCP:LISTEN -t | head -1) | grep -qw $APP_PID"
  check "port $YJS_PORT owned by our yjs" sh -c "ps -o pgid= -p \$(lsof -nP -iTCP:$YJS_PORT -sTCP:LISTEN -t | head -1) | grep -qw $YJS_PID"
  check "/login renders" curl -sf -o /dev/null "http://127.0.0.1:$APP_PORT/login"
  return "$ok"
}

# Creates a fresh user through better-auth's own adapter, so the signup hook
# seeds the template documents, and prints a signed session cookie to set in
# the browser. It replaces only the GitHub OAuth hop. The script imports
# Potion's modules, so it is written into the Potion checkout and runs there.
login() {
  load
  eval "$(exports)"
  cat >"$STATE_DIR/login.ts" <<'EOF'
import { serializeSignedCookie } from 'better-call';

import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db';

const name = process.argv[2] || 'Verify User';
const stamp = Date.now().toString(36);
const ctx = await auth.$context;
const user = await ctx.internalAdapter.createUser({
  email: `verify-${stamp}@example.test`,
  emailVerified: true,
  name,
  username: `verify-${stamp}`,
});
const session = await ctx.internalAdapter.createSession(user.id);
const cookieName = ctx.authCookies.sessionToken.name;
const header = await serializeSignedCookie(
  cookieName,
  session.token,
  ctx.secret
);
const cookieValue = header.slice(cookieName.length + 1).split(';')[0];
const documents = await prisma.document.findMany({
  orderBy: { createdAt: 'asc' },
  select: { id: true, title: true },
  where: { userId: user.id },
});

// Run setCookieJs in a tab on the app origin, then reload.
const setCookieJs = `document.cookie = "${cookieName}=${cookieValue}; path=/; SameSite=Lax"`;

console.log(
  JSON.stringify({ documents, setCookieJs, userId: user.id }, null, 2)
);
await prisma.$disconnect();
process.exit(0);
EOF
  bun x dotenv -e .env.local -- bun x tsx "$STATE_DIR/login.ts" "${1:-Verify User}"
}

down() {
  [ -f "$STATE" ] || { echo "no stack state in $ROOT; nothing to stop"; return 0; }
  load
  for pid in "$APP_PID" "$YJS_PID"; do kill -- "-$pid" 2>/dev/null || true; done
  docker rm -f "$PG_NAME" "$REDIS_NAME" >/dev/null 2>&1 || true
  rm -f "$STATE"
  echo "stopped; evidence kept in $STATE_DIR/evidence"
}

case "${1:-}" in
  up) up ;;
  doctor) doctor ;;
  login) login "${2:-}" ;;
  env) load; exports ;;
  down) down ;;
  *) echo "usage: $SCRIPT up|doctor|login [name]|env|down" >&2; exit 2 ;;
esac
