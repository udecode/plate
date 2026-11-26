---
description: Active Local CI formal check for www autoformat and basic marks keystroke shorthands, paragraph isolation, undo/Backspace, and IME commit parity. Use before and after changing apps/www/src/registry/components/editor/autoformat.tsx, basic-marks.tsx, or input rules.
argument-hint: '[check | deep | lower | typed <keys> | update]'
name: autoformat-input-rules
metadata:
  skiller:
    source: .agents/rules/autoformat-input-rules.mdc
---

# Autoformat input rules

Handle `$ARGUMENTS`. Active Local CI gate parsing shorthands from `autoformat.tsx` and `basic-marks.tsx` and typing them key by key into real `BasicMarksKit` + `AutoformatKit` editors.

**The property.** Typed key by key between neighbor paragraphs, every declared shorthand yields its promised symbol or marked text with no stray delimiter, stays literal inside words (except sub/sup tokens), leaves neighbor paragraphs untouched, reverts cleanly on one undo or Backspace, and matches when the final key commits via composition.

**The harm.** Colliding input rules break documented shorthands (`==yellow==`, `***both***`, `H~2~O`, `!>=`), pull neighbor paragraphs in, or throw on IME commits.

## Run it

- `pnpm check autoformat-rules` (`pnpm check:autoformat-rules`, active Local CI gate): 3-key bound (3,821 runs in plain + struck-text paragraphs + 241 declared checks).
- `pnpm check autoformat-rules --light`: 2-key bound (461 runs + all 241 declared checks) for pre-panel runs.
- `pnpm check:autoformat-rules --length=4`: 4-key deep run (54,446 runs, skips baseline).
- `pnpm check:autoformat-rules --typed='<keys>'`: inspect one sequence across contexts.
- `pnpm check:autoformat-rules --lower`: shrink `apps/www/scripts/autoformat-input-rules-baseline.json` after fixes.

Exit 0 passes, 1 reports findings (`autoformat-declared`, `autoformat-blocks`, `autoformat-undo`, `autoformat-backspace`, `autoformat-composition`), 2 reports bad flags or AST-vs-runtime rule-count mismatch.

## Bounds and assumptions

- 15-character alphabet up to length 3, 1-char mark content, and `stored` composition landing in struck text (Editing mode only).
- Excludes block input rules (`# `, lists, quotes, code fences, HR, link automd), browser `beforeinput`/real IME events, Suggesting composition, multi-step undo/redo, and word Backspace.

## Bug vs drift

- **Real bug:** declared shorthand fails/collides, corrupts neighbors, or diverges on undo/Backspace/composition. Fix rule, kit order, or runtime and run `--lower`.
- **Modeling error / intended change:** update `apps/www/scripts/autoformat-input-rules.ts` (`EXPECTED_MARK_SYNTAX`), kit declarations, and `docs/editor-behavior/markdown-editing-spec.md` together; never grow baseline.

## Coverage record

Synced at `fix(platejs): give back a shorthand that just fired on the next Backspace`. Check drift with `git log --oneline <commit>..HEAD -- apps/www/src/registry/components/editor/{autoformat,basic-marks}.tsx packages/platejs/src/lib/plugins/input-rules apps/www/scripts/autoformat-input-rules.ts`; move sync commit only after confirming script and passing `pnpm check:autoformat-rules`.

Covered paths: `apps/www/src/registry/components/editor/{autoformat,basic-marks}.tsx`, `packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.ts`, `packages/platejs/src/lib/plugins/input-rules/{createInputRules,markInputRule.internal,InputRulesPlugin}.ts`, `packages/platejs/src/internal/plugin/{resolvePlugins,compilePlateModel}.ts`, `packages/plitejs/src/react/editable/{mutation-controller,mutation-full-block-editing}.ts`, `packages/plitejs/src/core/{view-carets,public-state,composition-stamp,command-frame}.ts`, `packages/plitejs/src/history/history-merge-policy.ts`, `packages/plitejs/src/authored/authored.ts`.

Use `/pstack:maintain-formal-verification-skill` after changes that skipped this check.
