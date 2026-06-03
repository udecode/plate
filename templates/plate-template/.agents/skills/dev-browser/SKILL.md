---
description: Fallback browser automation with persistent Chrome state. Use only when Browser Use is unavailable or blocked.
name: dev-browser
metadata:
  skiller:
    source: .agents/rules/dev-browser.mdc
---

# Dev Browser

Use this only as the fallback browser path when `[@browser-use](plugin://browser-use@openai-bundled)` is unavailable or blocked.

Do not substitute Puppeteer, standalone Playwright, or raw Chrome DevTools for this fallback path.

## Installation

```bash
npm install -g dev-browser
dev-browser install
```

Run `dev-browser --help` to learn more.

## Plate Defaults

- Use `dev-browser --connect http://127.0.0.1:9222` by default. Do not preflight `9222` first.
- Only inspect `9222` after a direct `dev-browser --connect http://127.0.0.1:9222` attempt fails.
- Reuse one persistent debug Chrome on `127.0.0.1:9222`. Do not spin up disposable browser instances unless the user asks.
- Use a dedicated Chrome `--user-data-dir` for that debug browser, not the user's normal daily Chrome data dir.
- Clone the signed-in Chrome profile into the dedicated debug dir, then launch the debug browser from that clone.
- On macOS, launch the debug browser with `open -na "Google Chrome" --args ... --remote-debugging-port=9222` so it opens as a separate Chrome instance without hijacking the user's normal window.
- Do not close or stop the user's connected debug browser. Leave that debug window open and reuse it. Close named pages only when needed.
- Keep scripts small and direct. Prefer `browser.getPage("persistent-main")` for the main app.
- Use `dev-browser` instead of `agent-browser` or next-devtools `browser_eval`.
- For Plate registry/browser proof, prefer `/blocks/[id]-demo` over docs wrappers when that standalone demo route exists.
- If `dev-browser` gets blocked by a human prompt or loops on the same step, stop and ask the user to unblock.

## Fallback Setup

Use this only after `dev-browser --connect http://127.0.0.1:9222` fails because no reusable debug Chrome is available or the CDP endpoint is broken.

## Rules

- Prefer one permanent debug browser/profile over disposable automation browsers.
- Treat a custom `--user-data-dir` as mandatory, not optional. Chrome 136+ expects remote debugging to happen from a dedicated profile.
- Keep auth in that profile. Do not fall back to cookie dumps or state files unless the user asks.
- Use a separate signed-in Chrome profile for browser work, like `dev`. Do not use the user's normal daily `Default` profile as the source profile.
- Clone that separate signed-in Chrome profile into the dedicated debug `--user-data-dir`; do not point `9222` straight at the user's daily Chrome data dir.
- On macOS, use `open -na "Google Chrome" --args ...` for the debug browser. That starts a separate Chrome instance with the dedicated debug profile without touching the user's normal Chrome window.

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

Healthy output includes a JSON object with `webSocketDebuggerUrl`. Empty output or `404` means the wrong process owns `9222`.

Then verify:

```bash
dev-browser --connect http://127.0.0.1:9222 <<'EOF'
const page = await browser.getPage("persistent-main");
console.log(await page.title());
EOF
```

If direct connect still cannot resolve CDP even though `/json/version` is healthy, connect with the exact websocket URL:

```bash
WS=$(curl -sS http://127.0.0.1:9222/json/version | jq -r '.webSocketDebuggerUrl')

dev-browser --connect "$WS" <<'EOF'
const page = await browser.getPage("persistent-main");
console.log(await page.title());
EOF
```

## Google Chrome Path

Default setup on macOS:

1. Pick a separate signed-in Chrome profile for agent work, like `dev`, not the daily `Default` profile.
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

Do not point `9222` at the normal daily `Default` Chrome profile.

If the wrong Chrome steals `9222`, identify it with:

```bash
lsof -nP -iTCP:9222 -sTCP:LISTEN
```

Kill that listener and relaunch the dedicated debug browser. Do not keep debugging against a stale `404` or empty `/json/version` owner.
