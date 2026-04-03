---
description: One-time setup for a persistent debug browser on `127.0.0.1:9222` for `dev-browser --connect`. Use when browser work is needed but no reusable debug browser is running yet.
name: browser-debug-setup
metadata:
  skiller:
    source: .agents/rules/browser-debug-setup.mdc
---

# Browser Debug Setup

Use this skill when `dev-browser --connect http://127.0.0.1:9222` fails because
no persistent debug browser is running yet.

## Goal

Get the user onto one persistent browser/profile that both the human and the
agent reuse. Minimize the `Allow remote debugging?` popup by keeping one
dedicated debug browser/profile alive.

## Rules

- Prefer one permanent debug browser/profile over disposable automation
  browsers.
- Treat a custom `--user-data-dir` as mandatory, not optional. Chrome 136+
  basically wants remote debugging to happen from a dedicated profile.
- Keep auth in that profile. Do not fall back to cookie dumps or state files
  unless the user asks.
- Use a separate signed-in Chrome profile for browser work, like `dev`. Do not
  use the user's normal daily `Default` profile as the source profile.
- Clone that separate signed-in Chrome profile into the dedicated debug
  `--user-data-dir`; do not point `9222` straight at the user's daily Chrome
  data dir.
- On macOS, use `open -na "Google Chrome" --args ...` for the debug browser.
  That starts a separate Chrome instance with the dedicated debug profile
  without touching the user's normal Chrome window.

## Preferred Shape

Use a dedicated browser/profile with:

- `--remote-debugging-address=127.0.0.1`
- `--remote-debugging-port=9222`
- a persistent `--user-data-dir=<debug-profile-dir>`

Sign in once in that dedicated browser and keep reusing it for agent work.

Quick sanity check:

```bash
curl -sS http://127.0.0.1:9222/json/version
```

Healthy output includes a JSON object with `webSocketDebuggerUrl`. Empty output
or `404` means the wrong process owns `9222`.

Then verify `dev-browser`:

```bash
dev-browser --connect http://127.0.0.1:9222 <<'EOF'
const page = await browser.getPage("persistent-main");
console.log(await page.title());
EOF
```

If `dev-browser --connect http://127.0.0.1:9222` still cannot resolve CDP even
though `/json/version` is healthy, connect with the exact websocket URL:

```bash
WS=$(curl -sS http://127.0.0.1:9222/json/version | jq -r '.webSocketDebuggerUrl')

dev-browser --connect "$WS" <<'EOF'
const page = await browser.getPage("persistent-main");
console.log(await page.title());
EOF
```

## Google Chrome Path

Default setup on macOS:

1. Pick a separate signed-in Chrome profile for agent work, like `dev`, not
   the daily `Default` profile.
2. Map that human-facing Chrome profile name to the real folder in `Local State`.
3. Clone that profile into the dedicated debug dir.
4. Launch a separate Chrome instance on `9222`.
5. Leave that debug window open and reuse it.

```bash
python3 - <<'PY'
import json, pathlib
p = pathlib.Path('~/Library/Application Support/Google/Chrome/Local State').expanduser()
obj = json.loads(p.read_text())
for key, val in obj.get('profile', {}).get('info_cache', {}).items():
    print(f"{key}\tname={val.get('name')}\tgaia_name={val.get('gaia_name')}")
PY

# Example: if `dev` maps to `Profile 1`, clone `Profile 1`.
mkdir -p "$HOME/.config/google-chrome-debug-profile/Default"
rsync -a --delete \
  --exclude='Singleton*' \
  --exclude='DevToolsActivePort' \
  --exclude='lockfile' \
  "$HOME/Library/Application Support/Google/Chrome/Profile 1/" \
  "$HOME/.config/google-chrome-debug-profile/Default/"
cp "$HOME/Library/Application Support/Google/Chrome/Local State" \
  "$HOME/.config/google-chrome-debug-profile/Local State"

open -na "Google Chrome" --args \
  --user-data-dir="$HOME/.config/google-chrome-debug-profile" \
  --profile-directory="Default" \
  --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port=9222
```

That keeps the signed-in identity while still satisfying Chrome's dedicated
`--user-data-dir` requirement.

Then keep reusing that exact debug browser. Do not point `9222` at your normal
daily `Default` Chrome profile.

## After Setup

- Use `dev-browser --connect http://127.0.0.1:9222` for browser work.
- Reuse named pages like `persistent-main`.
- Do not stop the user's debug browser unless they ask.
- If the wrong Chrome steals `9222`, identify it with `lsof -nP -iTCP:9222 -sTCP:LISTEN`,
  kill that listener, and relaunch the dedicated debug browser. Do not keep
  debugging against a stale `404` or empty `/json/version` owner.
