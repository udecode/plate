---
description: Verify Plate and Plite packages, editor states, CLI outputs, docs, and registry artifacts through their real proof owners. Use before checking, skipping, or deferring a proof gate, reproducing a bug, closing a browser-visible change, or running a playtest or sweep.
argument-hint: '[package | route | cli | collaboration | testing audit | sweep | playtest] <target>'
name: verify
metadata:
  skiller:
    source: .agents/rules/verify.mdc
---

# Verify

Plate's driver skill for proof selection, launch, health checks, driving, evidence, and cleanup. `.agents/pstack/rules/tests.md` owns test shape; `test-audit` prunes tests (`verify testing audit [scope]` runs its full mode).

## Completion boundary

State reported setup, input, expected result, and follow-up first. Pick the smallest boundary that observes each required result: model tests or synthetic events cannot certify native input, focus, paint, or a reporter-named route. Never weaken assertions, drop requirements, or trust a cached pass (rerun Turbo with `TURBO_FORCE=true` and watch for `No tests matched`).

For flaky, native, focus, selection, drag-and-drop, compositor, lifecycle, or device risk, run the final proof 5 times warm with zero retries (`PLAYWRIGHT_RETRIES=0`); one failure keeps the case open. Prove any pre-existing failure at `HEAD` in a detached worktree via `node tooling/scripts/proof-worktree.mjs`.

## Canonical inventory

Discover Plite browser journeys without launching an app:

```bash
node apps/plite/scripts/inspect-plite-browser.mjs journeys [example] [--case '<name>']
```

Maintained user-facing feature map: [features/README.md](./features/README.md) (audited by `/pstack:maintain-verification-skill`).

| Surface | Inventory and proof owner | Recipe |
| --- | --- | --- |
| Plite examples | `apps/www/src/app/(app)/examples/plite/plite-example-registry.ts`; `apps/plite/tests/plite-browser/` | [features/plite-examples.md](./features/plite-examples.md) |
| Plate copied UI | `apps/www/src/registry/`; `apps/www/src/app/(blocks)/blocks/[name]/page.tsx` | [features/plate-ui-blocks.md](./features/plate-ui-blocks.md) |
| Public packages | `tooling/entrypoints/entrypoint-dag.mjs`; `tooling/entrypoints/entrypoint-turbo.mjs` | [features/public-packages.md](./features/public-packages.md) |
| Schema CLI | `packages/cli/src/bin.ts`; `packages/cli/test/` | [features/schema-cli.md](./features/schema-cli.md) |
| Docs and registry | `content/docs`; `apps/www/src/lib/source.ts`; `tooling/scripts/page-health.mjs` | [features/docs-registry.md](./features/docs-registry.md) |
| Formal checks | `rg -l '^## Coverage record' .agents/rules` | Load the area's formal skill (`authored-invariants`, `yjs-peer-order`, `markdown-round-trip`, `autoformat-input-rules`, `table-grid-commands`). |
| Potion | `../potion` beside main checkout | `.agents/rules/potion/references/stack.md` |
| Performance | `benchmarks/targets/slate-v2.json` | Load `benchmark` and `pstack:benchmark-checklist`. |

## Launch

Run from the current checkout on owned ports; never reuse another checkout's listener. Keep PIDs/handles for cleanup.

- **Plate app (read-only tree / hand drive):** start `www-drive` (port 3519, `PLATE_WWW_DRIVE_DIR=docs/plans/artifacts/drive PLATE_WWW_DEV_SOURCE=1 PLATE_WWW_DYNAMIC_DOCS=1 NEXT_PUBLIC_PLATE_WWW_NO_SYSTEM_THEME=1`). Avoid `pnpm --filter www dev` during proofs because it rewrites registry files via `build:registry`.
- **www browser specs:** start `www-plite-drive` (adds `PLATE_WWW_PLITE=1`, port 3653) or let `test:www-browser:chromium` start `pnpm dev:plite`. Warm slow docs routes once with `curl`.
- **Plite examples:** `pnpm --filter plite exec next dev --port 3298` (interactive) or `pnpm --filter plite test:plite-browser:chromium <file-or--grep>` (managed, serial).
- **Yjs Hocuspocus:** `PLITE_YJS_STORAGE_DIR=<run-dir>/yjs-data bun tooling/plite/donor/yjs/hocuspocus-server.ts` (waits for `Hocuspocus listening` on port 4444).
- **Schema CLI:** `pnpm --filter @platejs/cli build`, then run `node <abs>/packages/cli/dist/bin.js` from a disposable consumer dir.

Ready means both the server ready line and the exact route returning HTTP 200 without an error overlay.

## Doctor

Run read-only checks before driving and after unexpected failures:

1. `node apps/plite/scripts/inspect-plite-browser.mjs doctor` (read both `fresh` fields).
2. `lsof -nP -iTCP:<port> -sTCP:LISTEN` and `lsof -a -p <pid> -d cwd -Fn` (confirm port belongs to this checkout).
3. `curl --fail --silent --show-error http://localhost:<port>/api/plite/ready` (verify `devSource`, `dynamicDocs`, and `plite` when needed), then inspect the route in-browser.
4. For CLI: `node <abs>/packages/cli/dist/bin.js --version` matches `packages/cli/package.json`.
5. For install corruption (`Invalid hook call`, mixed `.bun`/`.pnpm` React, null `resolveDispatcher()`), run `pnpm run reinstall` once and retest.

## Drive

Use the host's built-in browser (`preview_*` in T3 Code, Claude browser in Claude Desktop) for ordinary web QA, and OpenCode `browse` (`~/.local/bin/browse`) in Chrome for native clipboard, downloads, profiles, or Chrome-specific claims. Follow `.agents/pstack/rules/browser.md` for key-by-key typing and frame checks.

- **Specs first:** run Playwright specs via their package runner (`pnpm --filter plite test:plite-browser:chromium ...` or `PLAYWRIGHT_BASE_URL=http://localhost:3653 pnpm --filter www test:www-browser:chromium ...`). Never build ad hoc Puppeteer/CDP drivers.
- **Read dumps before rerunning:** inspect `error-context.md`, failure screenshot, and `editor-state.json` in `test-results/` first. Use `--trace retain-on-failure` (www) or `PLITE_BROWSER_TRACE=1` (Plite) only when timing remains unclear.
- **React Compiler:** Bun specs run uncompiled; prove copied-UI values from editor/plugin state in the www browser without `PLATE_WWW_WEBPACK`.
- **Native clipboard:** only `'native'` transport (Chromium/Firefox) proves native clipboard; WebKit/emulated mobile use `'event'`.
- **Runners:** run `platejs`/`plitejs` folders via partitions (`pnpm --filter platejs run test:partition:<name>` or `node tooling/scripts/package-tests.mjs`), never raw `bun test <folder>` (`mock.module` leaks). Run `apps/www` Bun specs from root via `pnpm test apps/www/<path>`. Android emulator / iOS Simulator drives reproduce within emulator limits; real device or OS IME claims still need a person's recheck.

## Hand drive

Every browser-visible change gets one hand drive before close:

1. `node tooling/scripts/hand-drive.mjs scope <file...>` (map unmapped files with `route <file> <page...>` or `route <file> --none "<reason>"`).
2. Run `pnpm lint:task`, wait >=5 s after the last edit, drive each cell on `www-drive` at 1280x900 light (plus 375 px / dark when affected), and inspect screenshots.
3. `node tooling/scripts/hand-drive.mjs check <file...>` verifies fresh error-free visits (enforced by Stop hook).

## Playtest and sweep

- **Playtest:** `node tooling/scripts/playtest.mjs scope <file...>` finds catalogs in `docs/editor-behavior/scenarios/`. Run `node tooling/scripts/playtest.mjs specs <feature> --dir <run-dir>` at build close (add interactive catalog drive + 6-move improvisation for `verify playtest <feature>`).
- **Sweep:** See [references/sweep.md](./references/sweep.md) for beta sweep rounds, parallel agent lanes (`tooling/scripts/sweep-pass.mjs`), domain triage (`#triage-a-domain`), and rechecks.

## Failed native diagnostics

After a failed fix or failed stability run on native selection, focus, popup/toolbar focus, keyboard, or exact-route behavior, freeze product bytes and record:

1. **Selection:** native range, model selection, and view selection before/after each input, at import, and at next input (`selection-transition-trace`, `first-divergence`).
2. **Focus:** native `activeElement`, imperative DOM API, and React focus context per mounted view (`focus-state-trace`), plus `activeElement` before/after every DOM selection write (`selection-focus-trace`).
3. **Popup/toolbar focus:** `focusin`/`focusout`, focus owner at mount/positioned/settled/follow-up-key, `focus()` target connected/visibility/disabled state, and timer/rAF callbacks (`focus-owner-trace`, `focus-call-trace`, `focus-scheduler-trace`).
4. **Exact route:** replay the literal reporter route (`exact-route-reproduction`) and explain why the prior proof passed before editing code.

## Evidence

Save logs, fingerprints, screenshots, and copied `test-results` under `docs/plans/artifacts/<task-slug>/` (Git-ignored). Pass `--output docs/plans/artifacts/<task-slug>/<name>-results` to Playwright when supported, or copy `apps/plite/test-results/` before the next run. Visual claims require inspected before/after screenshots. Use `recordBrowserRuntimeErrors` (`{ strict: true }` when every error fails). Wrap proof commands with `node .agents/pstack/proof.mjs --dir <run-dir> --name <name> -- <command>`.

## Cleanup

Stop only processes/servers you started by PID/handle (never kill by process name). Remove only disposable consumers, scratch state, and temp worktrees (`git worktree remove --force <path>` plus its `.git-private/worktrees/` folder if detached). Confirm cited evidence still exists after cleanup.

## Helpers

- `node apps/plite/scripts/inspect-plite-browser.mjs <journeys|doctor>`
- `node tooling/scripts/proof-worktree.mjs <path> <sha> [--install] [--with <file>] [--dir <dir> --name <name> --expect-fail <text> -- <cmd>]`
- `node tooling/scripts/hand-drive.mjs <scope|route|check> ...`
- `node tooling/scripts/playtest.mjs <scope|specs> ...`
- `node tooling/scripts/page-health.mjs [--list]`
- `node tooling/scripts/sweep-pass.mjs <rows|plan|collect> ...`
- `node tooling/scripts/dev-servers.mjs list`
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`
