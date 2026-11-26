# Potion stack

How to run Potion locally, sign in a test user, drive the real web UI, prove a Plate fix against Potion, and keep
the evidence. The primary surface is the web UI at
`/` (signed in) and `/editor` (the public Plate playground). Server functions
under `/_serverFn/` and the server routes under `/api/` are internals, not
proof.

To reproduce a Potion-reported Plate bug and prove its fix locally: cut a detached Potion worktree (`git -C $POTION worktree add --detach $PW HEAD`), copy `.env.local` and `.dev.vars`, rebuild `pnpm --filter www build:registry` if registry files changed, sync with `cd $PW && bun run sync:plate --local <plate-worktree>`, then run `"$STACK" up`, `doctor`, `login`, drive red before the fix and green after, copy evidence to `$RUN/potion/`, run `"$STACK" down`, and remove `$PW`.

Potion runs as a TanStack Start app on the Cloudflare Vite plugin. `vite dev`
runs the Worker in workerd, and its D1 binding `DB` (database `potion`) keeps
its data under `.wrangler/state/` in the Potion checkout. Collaboration is off
until Plate's native sync runs on Durable Objects.

The [feature map](./features/README.md) lists every user path this recipe
knows. A proof that drives one convenient entry point is incomplete when the
map lists others for the same behavior.

## The script

`potion-stack.sh` lives in Plate at `.agents/skills/potion/scripts/`. It runs
against the Potion checkout that `VERIFY_POTION` names, or the current
directory when that is unset. Set both once per shell, from the Plate
checkout: `export VERIFY_POTION=<potion checkout>` and
`STACK=.agents/skills/potion/scripts/potion-stack.sh`.

Every command below is `"$STACK" <command>`, quoted, because zsh does not split
an unquoted variable into words. The script writes its state, logs and cookie
jars under the Potion checkout's `tmp/verify/`.

## Launch

```bash
"$STACK" up
```

It refuses when its state file exists or when the port is taken. It then:

1. Uses the checkout's `.dev.vars` when it has one, and refuses when that file
   sets no `BETTER_AUTH_SECRET`. A checkout without `.dev.vars` gets a generated
   one with fresh secrets and no AI or Upstash keys, which `down` removes. The
   script never prints the file. When `.dev.vars` sets
   `UPSTASH_REDIS_REST_TOKEN`, rate limits count against the real Upstash, and
   `up` says so. The generated file sets `FILES_STORAGE=memory`, so uploads
   through `/api/files` live in the dev server's memory and vanish when it
   stops. A `.dev.vars` without that line uses `wrangler.jsonc`'s R2 bucket,
   which needs the R2 keys, and `up` says so.
2. Applies the Drizzle migrations with
   `wrangler d1 migrations apply potion --local`. It never passes `--remote`.
3. Starts `vite dev` on `127.0.0.1:3000` in its own process group, with
   `VITE_SITE_URL` set to that address for better-auth.
4. Prints `ready: http://127.0.0.1:3000` once `/login` renders. The first
   compile takes up to a few minutes.

The local D1 is the checkout's own `.wrangler/state`, because the Vite plugin
reads its persist folder from `vite.config.ts`. A checkout that has no state
yet gets one that `down` removes. Otherwise the stack adds its users and pages
to the data already there, so a proof finds its rows by the user it signed in.

Port 3000 is the one Potion's OAuth callbacks and R2 CORS rules name. When
another server holds it, set `VERIFY_APP_PORT` to a free port and pass it to
every later command, `down` included. The dev server's log is
`tmp/verify/logs/vite.log`, and the migration's is `migrate.log`.

Always browse `http://127.0.0.1:<port>`, never `localhost:<port>`. Browsers
share `localhost` cookies across ports, so another local app's httpOnly
`better-auth.session_token` on `localhost` shadows the test user's, and the
app renders signed out.

## Doctor

```bash
"$STACK" doctor
```

Read-only. Checks that `.dev.vars` sets `BETTER_AUTH_SECRET`, the migrations
are applied, the dev server's process group is alive and owns the port, and
`/login` renders. Run it first whenever anything looks off. It exits 1 and
prints a `FAIL` line for each failed check.

## Sign in

```bash
"$STACK" login > <potion checkout>/tmp/verify/login.json
"$STACK" login "Verify User" > <potion checkout>/tmp/verify/login-2.json
```

Both sign in by email through better-auth. The dev server allows email
sign-up, which a production build turns off, so the stack creates users over
HTTP and the login dialog only signs in.

Without a name, `login` signs in the default user, `agent@potion.local`, with
the fixed local password `potion-local-agent`, and signs that user up on first
use. With a name, it signs up a new email user with a throwaway password, so
that user signs in only through its cookie jar. Either way the sign-up hook
gives a new user its 13 template pages (Playground, AI, Callout, Upload and
more). It prints JSON with `email`, `userId`, `cookieJar` and `documents`
(`id`, `title`). The cookie jar serves `curl -b <jar>`. A case with an owner
and another user takes one call of each kind.

A local D1 from before 2026-11-25 can hold an `agent@potion.local` user that
the removed Agent Login made. That user has no password, so `login` fails with
HTTP 422. Delete that user with `"$STACK" sql`, or start from a fresh
`.wrangler/state`.

The session cookie is httpOnly, so the browser signs in through the dialog:

1. Run `"$STACK" login` once, so the default user exists.
2. Open `http://127.0.0.1:<port>/login`.
3. Type `agent@potion.local` and `potion-local-agent`, and press Sign in.
4. The dialog reloads the app signed in. Pick a page.

## Drive

Use the built-in browser (`mcp__Claude_Browser__*`). Read the page with
`get_page_text` or `read_page`, and take a screenshot when layout is the point.

- Most sidebar and navbar buttons have no accessible name. Their names live in
  tooltips (`Create a new page`, `Search page`, `More actions`, `Comment`,
  `View all versions`). Find them by screenshot, or with `find` by visible
  text where it exists (`Collaborate`, `Add cover`, page titles).
- `Cmd+K` opens page search only while focus is outside the editor. Inside the
  editor it opens the link popover.
- The editor body is the Plate `contenteditable` under `main`. Type into it
  with the browser's key input, never by setting DOM text. A mention or slash
  menu needs one key per character.
- Each feature's recipe is in [the feature map](./features/README.md).

## Evidence

Write each proof to `tmp/verify/evidence/<YYYYmmdd-HHMMSS>-<slug>/` in the
Potion checkout:

- screenshots of the action and of the resulting state, copied from the files
  the screenshot tool saves,
- the side effect, usually the row: `"$STACK" sql 'select … from Document where id = …'`,
- a `README.txt` with the journey, the URL and the observed result.

Proof standards:

- Drive the real user path. A server function called by hand, a `sql` write
  and DOM edits can set up or diagnose a case, never prove it.
- Capture the action and the end state, and check the side effect (a database
  row, an upload) beside what is visible. A reload that still shows the change
  is the minimum for anything that persists.
- State the report's setup, input, expected result and follow-up before
  choosing the proof. A narrower green check cannot discard a visual, focus,
  selection, popup or follow-up requirement the report names. When the report
  names only a bad state and several outcomes would fix it, ask which one
  before writing the fix.
- Focus, selection, IME, drag-and-drop and other timing-prone behavior: run
  the final proof five times, warm. One failure keeps the case open.
- Report local verification separately from anything deployed. This stack
  proves the current checkout only.
- AI uses the real key from `.dev.vars` when present, and the evidence says
  so. Without a key, the AI routes return a fake stream, so an AI journey
  proves only the menu and its wiring. Never present that stream as an AI
  answer.

## Cleanup

```bash
"$STACK" down
```

It kills the process group it started, removes `.dev.vars` and
`.wrangler/state` only when `up` created them, and removes
`tmp/verify/stack.env`. It keeps `tmp/verify/evidence/` and
`tmp/verify/logs/`. Never kill by process name, because the user may run
another dev server. Run `down` after every failed attempt too.

`"$STACK" sql '<query>'` runs one query against the local D1, such as a
proof's row check.
