# Potion stack

How to run Potion in an isolated local stack, sign in a test user, drive the
real web UI and keep the evidence. It serves Plate's
[Potion proof lane](../potion.md) and any other Potion task that needs the
running app. The primary surface is the web UI at `/` (signed in) and
`/editor` (the public Plate playground). APIs (`/api/trpc`, `/api/[[...route]]`)
are internals, not proof.

The [feature map](./features/README.md) lists every user path this recipe
knows. A proof that drives one convenient entry point is incomplete when the
map lists others for the same behavior.

## The script

`potion-stack.sh` lives in Plate at `.agents/skills/verify/scripts/`. It runs
against the Potion checkout that `VERIFY_POTION` names, or the current
directory when that is unset. Set both once per shell, from the Plate
checkout: `export VERIFY_POTION=<potion checkout>` and
`STACK=.agents/skills/verify/scripts/potion-stack.sh`.

Every command below is `"$STACK" <command>`, quoted, because zsh does not split
an unquoted variable into words. The script writes its state, logs,
login script and uploads under the Potion checkout's `tmp/verify/`.

## Launch

```bash
"$STACK" up
```

It refuses when its state file exists, when another `next dev` holds the
checkout's `.next/dev/lock`, or when a port is taken. It then:

1. Starts `potion-verify-pg` (postgres:17-alpine) on `127.0.0.1:56432` and
   `potion-verify-redis` on `127.0.0.1:56379`, empty, and waits for a real
   `select 1` over TCP, not `pg_isready`.
2. Runs `prisma migrate deploy` against that database.
3. Starts the Yjs server (`src/server/yjs/server.ts`) on `4544` and `next dev`
   on `3100`, each in its own process group, with `.env.local` filling only
   the keys the stack does not set (AI). Uploads go through `/api/files` with
   the `fs` adapter, stored under `tmp/verify/files/`. Until Plate fixes
   migration blocker P14, the files gateway refuses uploads from a page on
   `127.0.0.1`. To drive an upload, start `next dev` with
   `NEXT_PUBLIC_SITE_URL=http://localhost:<port>`, set the login cookie on
   `localhost:<port>` and browse there.
4. Prints `ready: http://127.0.0.1:3100` once `/login` renders. The first
   compile takes up to a few minutes.

Other sessions often run a stack of their own. When `up` says a port is taken,
find free ports with `lsof -nP -iTCP:<port> -sTCP:LISTEN` and set every
override: `VERIFY_PG_PORT`, `VERIFY_REDIS_PORT`, `VERIFY_APP_PORT`,
`VERIFY_YJS_PORT`, and the container names `VERIFY_PG_NAME` and
`VERIFY_REDIS_NAME`. Pass the same overrides to every later command, `down`
included. `next dev` runs with an 8 GB heap (`VERIFY_NEXT_HEAP_MB`), because
the default heap runs out compiling the first document page. Logs are
`next.log`, `yjs.log` and `migrate.log` in `tmp/verify/logs/`.

Always browse `http://127.0.0.1:<port>`, never `localhost:<port>`. Browsers
share `localhost` cookies across ports, so another local app's httpOnly
`better-auth.session_token` on `localhost` shadows the test user's, and the
app renders signed out ("Sign in" in the sidebar, "This document does not
exist").

The stack never touches the user's own `potion_pg` on `5432`. On this machine
a native Postgres also owns `localhost:5432`, so `bun dev` against
`.env.local` gets `P1010 denied access`.

## Doctor

```bash
"$STACK" doctor
```

Read-only. Checks that both containers answer, migrations are applied, both
process groups are alive, the app and Yjs ports belong to those groups, and
`/login` renders. Run it first whenever anything looks off. It exits 1 and
prints a `FAIL` line for each failed check.

## Sign in

```bash
"$STACK" login "Verify User" > <potion checkout>/tmp/verify/login.json
```

It creates a fresh user through better-auth's own adapter, so the signup hook
seeds the 13 template documents (Playground, AI, Callout, Upload and more), and
prints JSON with `userId`, `documents` (`id`, `title`) and `setCookieJs`. In
the browser:

1. Open `http://127.0.0.1:<port>/login`.
2. Run `setCookieJs` with the page's JavaScript tool.
3. Navigate to `http://127.0.0.1:<port>/<document id>`.

This replaces only the GitHub OAuth hop, which an agent cannot drive. Every
later step goes through the real UI. Each `login` call makes a new user, so a
case with an owner and another user takes two calls.

## Drive

Use the built-in browser (`mcp__Claude_Browser__*`). Read the page with
`get_page_text` or `read_page`, and take a screenshot when layout is the point.

- Most sidebar and navbar buttons have no accessible name. Their names live in
  tooltips (`Create a new page`, `Search page`, `More actions`, `Comment`,
  `View all versions`). Find them by screenshot, or with `find` by visible
  text where it exists (`Collaborate`, `Add cover`, page titles).
- The page title is the textbox with placeholder `Untitled`. `Enter` in the
  title moves focus into the editor body.
- The editor body is the Slate `contenteditable` under `main`. Type into it
  with the browser's key input, never by setting DOM text.
- Each feature's recipe is in [the feature map](./features/README.md).

## Evidence

Write each proof to `tmp/verify/evidence/<YYYYmmdd-HHMMSS>-<slug>/` in the
Potion checkout:

- screenshots of the action and of the resulting state, copied from the files
  the screenshot tool saves,
- the side effect, usually the row:
  `docker exec <pg container> psql -U verify -d potion -c 'select … from "Document" where id = …'`,
- a `README.txt` with the journey, the URL and the observed result.

Proof standards:

- Drive the real user path. tRPC calls, `prisma` writes and DOM edits can set
  up or diagnose a case, never prove it.
- Capture the action and the end state, and check the side effect (a database
  row, a Yjs snapshot, an upload) beside what is visible. A reload that still
  shows the change is the minimum for anything that persists.
- State the report's setup, input, expected result and follow-up before
  choosing the proof. A narrower green check cannot discard a visual, focus,
  selection, popup or follow-up requirement the report names. When the report
  names only a bad state and several outcomes would fix it, ask which one
  before writing the fix.
- Focus, selection, IME, drag-and-drop, collaboration and other timing-prone
  behavior: run the final proof five times, warm. One failure keeps the case
  open.
- Report local verification separately from anything published. This stack
  proves the current checkout only.
- AI uses the real key from `.env.local` when present, and the evidence says
  so. Without a key, that journey reports a failure with the reason. Never
  stub it to pass.

## Cleanup

```bash
"$STACK" down
```

It kills the two process groups it started, removes both containers (they run
with `--rm`, so their data goes with them) and removes `tmp/verify/stack.env`.
It keeps `tmp/verify/evidence/` and `tmp/verify/logs/`. Never kill by process
name, because the user may run another Next server. Run `down` after every
failed attempt too.

`"$STACK" env` prints the overrides (`DATABASE_URL`, ports, secret) for an ad hoc
command, such as `eval "$("$STACK" env)" && bun x prisma studio` run from the
Potion checkout.
