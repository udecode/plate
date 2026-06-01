---
description: Slate v2 quality-gap Autoresearch shortcut. Runs deep-research and quality-gap loops for API/DX/architecture/test coverage gaps, then routes accepted findings to slate-patch, slate-plan, slate-ar-gate, or slate-ar-perf.
argument-hint: '[slug/topic | quality gap target]'
disable-model-invocation: true
name: slate-ar-quality
metadata:
  skiller:
    source: .agents/rules/slate-ar-quality.mdc
---

# Slate AR Quality

Handle $ARGUMENTS by loading `slate-ar` and running its quality-gap mode.

Use this when the user wants to perfect a Slate v2 surface beyond a single bug:
API/DX gaps, architecture gaps, missing behavior coverage, docs/reference
holes, example quality, or broad "make this better" research.

## Contract

- Target cwd is `.tmp/slate-v2`.
- Use generic Codex Autoresearch research and quality-gap mechanics through
  `slate-ar`.
- Keep durable state under `.tmp/slate-v2/autoresearch.research/<slug>/`.
- `quality_gap=0` closes the current accepted checklist only. It does not mean
  discovery is permanently complete.

## Commands

Prefer root shortcuts:

```bash
pnpm slate:ar:research-setup -- --slug "<slug>" --goal "<goal>"
pnpm slate:ar:quality-gap -- --research-slug "<slug>" --list
pnpm slate:ar:gap-candidates -- --research-slug "<slug>"
```

Use `gap-candidates --apply` only after inspecting the candidates and deciding
the write scope is safe.

## Routing

- Correctness gap with missing oracle: `slate-patch`.
- Test/behavior suite gap where the oracle exists: `slate-ar-gate`.
- Performance gap: `slate-ar-perf`.
- Public API/runtime architecture gap: `slate-plan`.
- Generic measured loop gap: `slate-ar`.

Do not use this as a substitute for a direct bug fix. If the failing behavior is
already known and reproducible, use `slate-patch`.
