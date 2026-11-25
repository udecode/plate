#!/usr/bin/env bash
# Local Potion stack for verification: the TanStack Start dev server (vite dev
# through the Cloudflare Vite plugin) with its local D1, on 127.0.0.1.
# Usage: potion-stack.sh up|doctor|login [name]|sql <query>|down
# VERIFY_POTION names the Potion checkout; it defaults to the current directory.
# VERIFY_APP_PORT sets the port; it defaults to 3000, the port Potion's
# OAuth callbacks and R2 CORS rules name.
set -euo pipefail

SCRIPT="$0"
ROOT="$(cd "${VERIFY_POTION:-$PWD}" && pwd)"
if [ ! -f "$ROOT/wrangler.jsonc" ] || [ ! -f "$ROOT/src/routes/api/dev/agent-login.ts" ]; then
  echo "$ROOT is not a Potion checkout on the Cloudflare stack (no wrangler.jsonc or src/routes/api/dev/agent-login.ts)" >&2
  exit 1
fi
cd "$ROOT"
STATE_DIR="$ROOT/tmp/verify"
STATE="$STATE_DIR/stack.env"
LOGS="$STATE_DIR/logs"
COOKIES="$STATE_DIR/cookies"
DB_NAME=potion
APP_PORT="${VERIFY_APP_PORT:-3000}"

listening() { lsof -nP -iTCP:"$1" -sTCP:LISTEN -t 2>/dev/null | head -1; }

load() {
  [ -f "$STATE" ] || { echo "no stack in $ROOT: run '$SCRIPT up' first" >&2; exit 1; }
  # shellcheck disable=SC1090
  . "$STATE"
}

save() {
  echo "APP_PORT=$APP_PORT OWN_DEV_VARS=$OWN_DEV_VARS OWN_D1=$OWN_D1 APP_PID=$APP_PID" >"$STATE"
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

# Always --local: nothing here may reach the remote D1.
d1() { bunx wrangler d1 "$@" "$DB_NAME" --local; }

up() {
  if [ -f "$STATE" ]; then
    echo "stack state exists at $STATE; run '$SCRIPT doctor' or '$SCRIPT down' first" >&2
    exit 1
  fi
  if [ -n "$(listening "$APP_PORT")" ]; then
    echo "port $APP_PORT is taken; set VERIFY_APP_PORT to a free port" >&2
    exit 1
  fi
  mkdir -p "$LOGS" "$COOKIES"

  # The Worker reads server values from .dev.vars. A checkout without one gets
  # a generated file with fresh secrets and no AI or Upstash keys; `down`
  # removes it. An existing file is used as it is and never printed.
  OWN_DEV_VARS=0
  if [ ! -f .dev.vars ]; then
    umask 077
    cat >.dev.vars <<EOF
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
FILES_API_SECRET=$(openssl rand -base64 32)
FILES_STORAGE=fs
FILES_FS_ROOT=tmp/verify/files
FILES_MAX_UPLOAD_SIZE=16777216
EOF
    OWN_DEV_VARS=1
  elif ! grep -Eq '^BETTER_AUTH_SECRET=.+' .dev.vars; then
    echo ".dev.vars has no BETTER_AUTH_SECRET; fill it as .env.example says" >&2
    exit 1
  fi
  if grep -Eq '^UPSTASH_REDIS_REST_TOKEN=.+' .dev.vars; then
    echo "note: .dev.vars sets UPSTASH_REDIS_REST_TOKEN, so rate limits count against the real Upstash" >&2
  fi

  # The dev server and wrangler both keep the local D1 under .wrangler/state.
  # The Vite plugin's persistState is a vite.config option, so the stack cannot
  # move it; a checkout with no state yet gets one the stack owns and `down`
  # removes.
  OWN_D1=0
  [ -d .wrangler/state ] || OWN_D1=1
  APP_PID=none
  save

  CI=1 d1 migrations apply >"$LOGS/migrate.log" 2>&1 || { cat "$LOGS/migrate.log" >&2; exit 1; }

  # VITE_SITE_URL is better-auth's base URL. Vite keeps a variable the process
  # already has over the one in .env.local.
  APP_PID="$(spawn "$LOGS/vite.log" env VITE_SITE_URL="http://127.0.0.1:$APP_PORT" \
    bunx vite dev --host 127.0.0.1 --port "$APP_PORT" --strictPort)"
  save

  # The first request compiles the route; ready means /login renders.
  wait_for vite 240 curl -sf -o /dev/null "http://127.0.0.1:$APP_PORT/login"
  echo "ready: http://127.0.0.1:$APP_PORT (logs in $LOGS)"
}

doctor() {
  load
  local ok=0
  check() {
    if "${@:2}" >/dev/null 2>&1; then echo "ok   $1"; else echo "FAIL $1"; ok=1; fi
  }
  check ".dev.vars sets BETTER_AUTH_SECRET" grep -Eq '^BETTER_AUTH_SECRET=.+' .dev.vars
  check "migrations applied" sh -c "bunx wrangler d1 migrations list $DB_NAME --local 2>&1 | grep -q 'No migrations to apply'"
  check "vite dev (pgid $APP_PID) alive" kill -0 "$APP_PID"
  check "port $APP_PORT owned by our vite" sh -c "ps -o pgid= -p \$(lsof -nP -iTCP:$APP_PORT -sTCP:LISTEN -t | head -1) | grep -qw $APP_PID"
  check "/login renders" curl -sf -o /dev/null "http://127.0.0.1:$APP_PORT/login"
  return "$ok"
}

# Signs a user in over HTTP and saves its session cookie in a curl jar.
# Without a name it is the development Agent user, agent@potion.local, which
# gets 13 template pages on first use. With a name it signs up a fresh email
# user, who gets its own 13 pages. Prints the user, the jar and the pages.
login() {
  load
  local base="http://127.0.0.1:$APP_PORT" name="${1:-}" jar slug
  if [ -z "$name" ]; then
    jar="$COOKIES/agent.txt"
    curl -sf -o /dev/null -c "$jar" -X POST --form-string callbackUrl=/ "$base/api/dev/agent-login"
  else
    slug="verify-$(date +%s)-$RANDOM"
    jar="$COOKIES/$slug.txt"
    # The password is a throwaway: the cookie jar is the sign-in.
    curl -sf -o /dev/null -c "$jar" -H 'content-type: application/json' -H "origin: $base" \
      --data "$(node -e 'console.log(JSON.stringify({email:`${process.argv[1]}@example.test`,name:process.argv[2],password:require("crypto").randomBytes(18).toString("base64url")}))' "$slug" "$name")" \
      "$base/api/auth/sign-up/email"
  fi
  local session
  session="$(curl -sf -b "$jar" "$base/api/auth/get-session")"
  local user_id
  user_id="$(node -e 'const s=JSON.parse(process.argv[1]||"null");if(!s?.user)process.exit(1);console.log(s.user.id)' "$session")" || {
    echo "sign-in returned no session; see $LOGS/vite.log" >&2
    exit 1
  }
  local docs
  docs="$(bunx wrangler d1 execute "$DB_NAME" --local --json \
    --command "select id, title from Document where userId = '$user_id' and parentDocumentId is null order by position")"
  node -e '
    const [session, docs, jar] = process.argv.slice(1);
    const { user } = JSON.parse(session);
    const documents = JSON.parse(docs)[0].results;
    console.log(JSON.stringify({ email: user.email, userId: user.id, cookieJar: jar, documents }, null, 2));
  ' "$session" "$docs" "$jar"
}

sql() {
  load
  [ -n "${1:-}" ] || { echo "usage: $SCRIPT sql '<query>'" >&2; exit 2; }
  bunx wrangler d1 execute "$DB_NAME" --local --json --command "$1"
}

down() {
  [ -f "$STATE" ] || { echo "no stack state in $ROOT; nothing to stop"; return 0; }
  load
  [ "$APP_PID" = none ] || kill -- "-$APP_PID" 2>/dev/null || true
  wait_for "port $APP_PORT to close" 30 sh -c "[ -z \"\$(lsof -nP -iTCP:$APP_PORT -sTCP:LISTEN -t)\" ]" || true
  [ "$OWN_DEV_VARS" = 1 ] && rm -f .dev.vars
  [ "$OWN_D1" = 1 ] && rm -rf .wrangler/state
  rm -f "$STATE"
  echo "stopped; evidence kept in $STATE_DIR/evidence"
}

case "${1:-}" in
  up) up ;;
  doctor) doctor ;;
  login) login "${2:-}" ;;
  sql) sql "${2:-}" ;;
  down) down ;;
  *) echo "usage: $SCRIPT up|doctor|login [name]|sql <query>|down" >&2; exit 2 ;;
esac
