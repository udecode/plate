---
description: Slate v2 Autoresearch recipe picker. Lists/recommends Codex Autoresearch recipes, produces read-only setup plans, and maps non-perf loops such as test runtime, typecheck, bundle size, memory, command latency, and quality-gap.
argument-hint: '[recommend | list | show <recipe> | setup <recipe> | prompt]'
disable-model-invocation: true
name: slate-ar-recipe
metadata:
  skiller:
    source: .agents/rules/slate-ar-recipe.mdc
---

# Slate AR Recipe

Handle $ARGUMENTS by loading `slate-ar` and using Codex Autoresearch recipes.

Use this when the user asks what Autoresearch loop to run, or when a task is
measured but not obviously performance-specific.

## Contract

- Default to read-only `recipes recommend`, `recipes list`, `recipes show`, and
  `setup-plan`.
- Target cwd is `.tmp/slate-v2`.
- Do not start packets unless the user explicitly asks to run the loop.
- Do not trust external recipe catalogs without inspecting them first.
- In Slate v2, prefer explicit Bun/package commands over a generic npm recipe
  when the recommender picks `node-test-runtime`.

## Built-In Recipe Uses

- `node-test-runtime` / `vitest-runtime`: test gate repeatability. Often route
  to `slate-ar-gate`.
- `typescript-compile-time`: typecheck/runtime graph pressure.
- `bundle-size`: package or site bundle footprint.
- `memory-usage`: workload memory smoke, after replacing the placeholder with
  the real workload.
- `command-latency`: custom command duration, after replacing the placeholder.
- `quality-gap`: accepted research checklist execution. Route to
  `slate-ar-quality`; use `slate-research` first when the checklist does not
  exist yet.
- `custom`: last resort when no built-in recipe fits.

## Commands

Use the installed TheGreenCedar plugin CLI until a root shortcut exists. Never
use the legacy `../codex-autoresearch` checkout; that repo can point at a
different upstream.

```bash
AR_CLI="$(find "${CODEX_HOME:-$HOME/.codex}/plugins/cache/thegreencedar-autoresearch/codex-autoresearch" -path '*/scripts/autoresearch.mjs' -print | sort -V | tail -1)"
test -n "$AR_CLI"
```

```bash
node "$AR_CLI" recipes list --cwd .tmp/slate-v2
node "$AR_CLI" recipes recommend --cwd .tmp/slate-v2
node "$AR_CLI" recipes show <recipe-id> --cwd .tmp/slate-v2
node "$AR_CLI" setup-plan --cwd .tmp/slate-v2 --recipe <recipe-id>
node "$AR_CLI" doctor --cwd .tmp/slate-v2 --check-benchmark --explain
```

If the recipe output is customized, run `benchmark-lint` before any packet.

## Handoff

Report the selected recipe, metric, direction, benchmark command, checks
command, caveats, and recommended owner: `slate-ar`, `slate-ar-quality`,
`slate-ar-gate`, `slate-ar-perf`, `slate-patch`, or `slate-plan`.
