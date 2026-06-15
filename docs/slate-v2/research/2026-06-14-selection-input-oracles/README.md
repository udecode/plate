# Selection Input Oracles

Date: 2026-06-14
Owner: slate-auto / slate-research
Status: covered-existing

## Verdict

External editor source points to composition and beforeinput target-range
handling as the highest-value selection/input oracle families. Slate v2 already
covers the promoted richtext composition invariants with focused browser rows,
so this shard did not patch runtime.

## Best Leads

| Lead | Source | Slate v2 status | Decision |
|------|--------|-----------------|----------|
| Composition inside marks and cursor wrappers must preserve marks, selection, and committed text | ProseMirror `view/test/webtest-composition.ts`; Lexical `LexicalEvents.ts` composition/beforeinput ownership | Covered by `playwright/integration/examples/richtext.test.ts` IME rows around bold markup, active marks, formatted siblings, multi-node Korean IME, and WebKit compositionend cleanup | promoted-covered |
| Beforeinput target ranges should outrank live DOM selection for browser text substitutions and deletes | Lexical `LexicalEvents.ts` target-range import; ProseMirror view input handlers | Covered by `packages/slate-react/test/selection-reconciler-contract.test.tsx`, `selection-reconciler-contract.ts`, `runtime-before-input-events-contract.test.ts`, and plaintext target-range Playwright rows | covered-existing |
| Same HTML/plain paste from prediction/autocorrect should stay plain text to preserve active formatting | Lexical HTML copy/paste unit test | Already promoted in P45/P51/P54 with package and browser proof | already-promoted |

## Proof

Focused Slate-native proof:

```bash
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts --grep "commits IME composition inside bold markup|commits IME composition through an active mark in an empty block|commits IME composition through an active mark before a formatted sibling|replaces multiple formatted text nodes with Korean IME composition|deletes rich text selection after WebKit compositionend|deletes rich text line selection after WebKit compositionend"
```

Result: 6 passed, 18 explicit browser-scope skips.

## Raw Artifacts

- `docs/research/raw/2026-06-14-selection-input-oracles/file-list.txt`
- `docs/research/raw/2026-06-14-selection-input-oracles/test-file-list.txt`
- `docs/research/raw/2026-06-14-selection-input-oracles/source-hits.txt`
- `docs/research/raw/2026-06-14-selection-input-oracles/test-hits.txt`
- `docs/research/raw/2026-06-14-selection-input-oracles/slate-v2-coverage-hits.txt`

## Workflow Notes

- Do not guess repo test roots for external editors. Use source discovery first.
- Do not feed newline-separated file lists to `xargs`; some OSS repos contain
  paths with spaces. Use `find -print0 | xargs -0`.
