# Slate v2 Hotkey Runtime Dependency Ralplan

Date: 2026-05-03  
Status: ready for implementation  
Skill: `slate-ralplan`  
Source repo: `/Users/zbeyens/git/slate-v2`

## Verdict

Replace `is-hotkey`. Do not keep it, do not fork it as a package, and do not import ProseMirror/Tiptap keymap code.

The right shape is a small Slate-owned hotkey matcher in `slate-dom`, with parity tests around today's Slate `Hotkeys` behavior plus two explicit upgrades:

1. preserve the current `mod+`, platform, optional-modifier, arrow/delete/enter grammar used by Slate today;
2. steal Lexical's stronger non-English keyboard behavior: match `event.key` first, then fall back to `event.code` only for single-letter shortcuts when `event.key` is non-ASCII.

This keeps the public `Hotkeys` API stable while removing a stale hot-path dependency.

## Intent / Boundary Record

Intent: remove a no-longer-maintained keyboard dependency from Slate v2 without creating new shortcut regressions.

Desired outcome: Slate owns the tiny hotkey matching substrate it already treats as editor runtime law. Package consumers keep importing `Hotkeys` from `slate-dom`; examples stop importing `is-hotkey` directly.

In scope:

- `slate-dom` hotkey matcher internals.
- `slate-react` keyboard command behavior that consumes `Hotkeys`.
- Slate examples and docs that currently recommend or import `is-hotkey`.
- Root and package dependency cleanup.
- Focused unit and browser proof for keyboard shortcuts.

Non-goals:

- No ProseMirror-style keymap plugin system.
- No Tiptap extension keyboard-shortcut API.
- No public breaking rename of `Hotkeys`.
- No arbitrary user-configurable shortcut registry in this slice.
- No Slate core command-priority rewrite just to remove one dependency.

Decision boundaries:

- The implementation may add private exports only if tests need them.
- The implementation may add a public `isHotkey` helper if examples genuinely need a generic matcher after direct `is-hotkey` imports are removed.
- The implementation must not increase per-keydown allocations.

Unresolved user-decision points: none.

## Current Source Evidence

Live Slate v2 currently imports `is-hotkey` directly in the hotkey runtime: `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/utils/hotkeys.ts:1`.

The current grammar is small and concrete:

- generic shortcuts include `mod+b`, `mod+i`, `mod+z`, `shift+enter`, `enter`, arrows, and `shift?+backspace/delete`: `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/utils/hotkeys.ts:8-23`.
- Apple-specific rows include `opt+left/right/up/down`, `cmd+shift?+backspace/delete`, `ctrl+h`, `ctrl+d`, `ctrl+k`, and `ctrl+t`: `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/utils/hotkeys.ts:25-40`.
- Windows rows include word delete and redo variants: `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/utils/hotkeys.ts:42-46`.
- `create()` compiles the generic/apple/windows checkers once and reuses them at event time: `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/utils/hotkeys.ts:52-65`.
- `slate-dom` exports the `Hotkeys` object: `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/index.ts:61`.

The keyboard command path depends on `Hotkeys` for history, break insertion, delete units, and movement: `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/editing-kernel.ts:916-1003`.

The package dependency is real, not docs-only:

- `slate-dom` depends on `is-hotkey`: `/Users/zbeyens/git/slate-v2/packages/slate-dom/package.json:23-25`.
- `slate-dom` carries `@types/is-hotkey`: `/Users/zbeyens/git/slate-v2/packages/slate-dom/package.json:31-33`.
- root dev dependencies include `@types/is-hotkey` and `is-hotkey`: `/Users/zbeyens/git/slate-v2/package.json:85` and `/Users/zbeyens/git/slate-v2/package.json:96`.
- lockfile entries remain in `/Users/zbeyens/git/slate-v2/bun.lock`.

Examples currently leak the dependency to users:

- rich text imports `is-hotkey`: `/Users/zbeyens/git/slate-v2/site/examples/ts/richtext.tsx:1`.
- docs recommend `is-hotkey` as a library: `/Users/zbeyens/git/slate-v2/docs/general/resources.md:9-10`.
- additional direct imports exist in `site/examples/ts/images.tsx`, `code-highlighting.tsx`, `iframe.tsx`, and `inlines.tsx`.

Prior local evidence says this dependency has already caused non-versioned install breakage:

- `/Users/zbeyens/git/plate-2/docs/plans/2026-03-30-local-is-hotkey-parse-failure.md` records a corrupted Bun mirror under `node_modules/.bun/is-hotkey@0.2.0/.../lib/index.js` and a full local env wipe to recover.

NPM freshness:

- `npm view is-hotkey version time repository license types dist.unpackedSize --json` on 2026-05-03 returned version `0.2.0`, last version publish `2020-11-24T14:43:01.562Z`, MIT, and unpacked size about 20 KB.
- `npm view w3c-keyname ...` returned version `2.2.8`, last publish `2023-06-07`, MIT, and about 8 KB unpacked. It is usable evidence through ProseMirror, but not enough reason to add a new dependency for Slate's current tiny grammar.

## Reference Evidence

Lexical:

- Lexical owns shortcut matching in editor utilities, not a third-party hotkey package.
- `isExactShortcutMatch` checks modifier masks, compares `event.key` case-insensitively, rejects code fallback for ASCII remapped layouts, and falls back to `event.code` for non-English single-letter layouts: `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalUtils.ts:995-1023`.
- Lexical's unit tests cover lowercase/uppercase, Dvorak/remapped ASCII, non-English fallback via `event.code`, and special keys: `/Users/zbeyens/git/lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:187-284`.
- Steal the behavior and proof style. Do not steal Lexical's command runtime; Slate already has its own editing kernel.

ProseMirror:

- `prosemirror-keymap` normalizes `Mod-`, `Cmd-`, `Ctrl-`, `Alt-`, and `Shift-` names: `/Users/zbeyens/git/prosemirror-keymap/src/keymap.ts:8-26`.
- It pre-normalizes a binding map, detects duplicate normalized keys, and creates a handler once: `/Users/zbeyens/git/prosemirror-keymap/src/keymap.ts:28-45`.
- It uses `KeyboardEvent.key` naming via `w3c-keyname`, then has a keyCode fallback for modified character keys while avoiding Ctrl-Alt on Windows because of AltGr: `/Users/zbeyens/git/prosemirror-keymap/src/keymap.ts:83-108`.
- Steal the `Mod-` grammar discipline and precompiled map idea. Do not import `prosemirror-keymap`; that brings ProseMirror's `Plugin`, `EditorView`, and command protocol into a Slate runtime utility.

Tiptap:

- Tiptap's core keymap is product-layer ProseMirror composition, not a reusable low-level matcher: `/Users/zbeyens/git/tiptap/packages/core/src/extensions/keymap.ts:68-99`.
- Its `keyboardShortcut` command normalizes names and synthesizes a `KeyboardEvent` that flows through ProseMirror `handleKeyDown`: `/Users/zbeyens/git/tiptap/packages/core/src/commands/keyboardShortcut.ts:5-89`.
- Its node-range extension handles `Mod` by inspecting platform and modifier booleans directly: `/Users/zbeyens/git/tiptap/packages/extension-node-range/src/node-range.ts:119-135`.
- Steal the idea that `Mod` is first-class DX. Do not steal Tiptap's extension-level keymap design.

Current `is-hotkey`:

- `is-hotkey` uses aliases and key codes, parses `shift?`, and can return a compiled checker: `/Users/zbeyens/git/slate-v2/node_modules/.bun/is-hotkey@0.2.0/node_modules/is-hotkey/src/index.js:18-40` and `/Users/zbeyens/git/slate-v2/node_modules/.bun/is-hotkey@0.2.0/node_modules/is-hotkey/src/index.js:87-100`.
- Its default matching path is `event.which` unless `byKey` is used: `/Users/zbeyens/git/slate-v2/node_modules/.bun/is-hotkey@0.2.0/node_modules/is-hotkey/src/index.js:143-148` and `/Users/zbeyens/git/slate-v2/node_modules/.bun/is-hotkey@0.2.0/node_modules/is-hotkey/src/index.js:172-178`.
- That is not the right long-term browser contract for Slate v2. Modern keyboard correctness needs `event.key` first, with careful `event.code` fallback.

## Decision Brief

Principles:

- Slate owns browser-editor invariants used by the editing kernel.
- Keyboard matching must be tiny, testable, and stable across platform/layout quirks.
- A shortcut dependency in the input hot path must earn its dependency slot.
- Public DX should remain Slate-close and unopinionated.
- Preserve existing behavior before improving edge cases.

Top drivers:

- `is-hotkey` has no release since 2020 and already caused local dependency corruption pain.
- Slate's current hotkey grammar is small enough to own.
- Lexical and ProseMirror prove the hard part is not package choice; it is tested key/modifier semantics.

Viable options:

1. Keep `is-hotkey`.
   - Pro: no immediate code change.
   - Con: stale runtime dependency, outdated `which`-centric default path, direct example leakage, recurring install/build friction.
   - Verdict: reject.

2. Fork `is-hotkey` as a package.
   - Pro: minimal porting.
   - Con: creates package maintenance for a 20 KB utility Slate can own in one file; still starts from dated semantics.
   - Verdict: reject.

3. Replace with `prosemirror-keymap` or Tiptap keymap.
   - Pro: maintained editor ecosystem code.
   - Con: wrong abstraction boundary; imports ProseMirror plugin/view/command assumptions into Slate.
   - Verdict: reject.

4. Add `w3c-keyname` and write a Slate wrapper.
   - Pro: ProseMirror-tested key naming.
   - Con: still adds dependency for a small current grammar; Slate only needs a subset and Lexical's non-English fallback can be implemented directly.
   - Verdict: keep as fallback if tests uncover hard key-name drift.

5. Vendor a Slate-owned matcher inspired by current `is-hotkey`, Lexical, and ProseMirror.
   - Pro: removes stale dependency, keeps Hotkeys API stable, gives full test ownership, avoids editor-model leakage.
   - Con: Slate owns the browser edge cases from now on.
   - Verdict: choose.

Consequences:

- `is-hotkey` and `@types/is-hotkey` disappear from package manifests and lockfile.
- Examples must either use `Hotkeys` helpers or a Slate-provided generic matcher.
- Non-Latin keyboard behavior becomes explicit test coverage, not a changelog rumor.
- Future shortcut API work starts from Slate-owned code.

## Public API Target

Stable:

```ts
import { Hotkeys } from 'slate-dom'
```

Keep the current `Hotkeys.isBold`, `isItalic`, `isUndo`, `isRedo`, movement, delete, split, and compose helpers.

Possible public helper only if examples need it:

```ts
import { isHotkey } from 'slate-dom'

if (isHotkey('mod+s', event)) {
  // Save.
}
```

Reject `createHotkeyMatcher` as public API. It exposes implementation mechanics and makes the common example read worse:

```ts
const isTabHotkey = createHotkeyMatcher('tab')
```

The final public helper should match the useful part of the old `is-hotkey` DX:

```ts
isHotkey('tab', event)
```

Reject public curried usage:

```ts
const isTabHotkey = isHotkey('tab')

if (isTabHotkey(event)) {
  // Tab.
}
```

That shape is overbuilt for examples and makes a boolean-check helper look like a matcher factory. Slate can keep compiled matchers private for semantic `Hotkeys` and cache direct `isHotkey(...)` calls internally.

Lexical comparison: Lexical favors semantic event helpers and key commands (`isTab(event)`, `isBold(event)`, `KEY_TAB_COMMAND`) rather than public curried matcher APIs. Slate should keep its semantic `Hotkeys` object and add direct `isHotkey(spec, event)` only for unopinionated custom shortcut checks; it should not copy Lexical's command dispatch surface in this dependency-removal slice.

Do not expose a ProseMirror/Tiptap keymap object in this slice.

## Internal Runtime Target

Add a private matcher, likely:

```ts
type HotkeySpec = string | readonly string[]

type HotkeyMatchOptions = {
  platform?: 'apple' | 'windows' | 'other'
}

type KeyboardEventLike = {
  key: string
  code?: string
  altKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  getModifierState?: (key: string) => boolean
}

function isHotkey(spec: HotkeySpec, event: KeyboardEventLike): boolean
function isHotkey(
  spec: HotkeySpec,
  options?: HotkeyMatchOptions,
  event?: KeyboardEventLike
): boolean {
  const matcher = getCachedHotkeyMatcher(spec, options)
  return matcher(event)
}
```

Matcher rules:

- parse once at module initialization or matcher creation;
- no regex allocation per keydown;
- modifiers: `mod`, `cmd`, `command`, `meta`, `ctrl`, `control`, `alt`, `opt`, `option`, `shift`;
- optional modifier suffix: `shift?`, and generic optional modifier support only if tests prove current behavior needs more than shift;
- key aliases: `left/right/up/down`, `backspace`, `delete`, `enter`, `return`, `tab`, `escape`, `space`, punctuation currently used by examples such as `` ` ``;
- matching order: exact modifier mask first, `event.key` case-insensitive next, `event.code` fallback only for single-letter expected keys when `event.key` is non-ASCII;
- Apple/Windows platform branching stays in `hotkeys.ts` or uses an injected platform option for unit tests;
- AltGr on Windows must not be misread as Ctrl+Alt shortcut behavior.

## Hook / Component / Render DX Target

No React API changes. No hooks. No effects.

Examples should become simpler, not more clever:

- rich text mark toggles should use Slate-owned hotkey helpers or matcher;
- image/code/iframe/inlines examples should not teach users to install `is-hotkey`;
- docs should remove `is-hotkey` from the current resources list and point to Slate-owned helpers where applicable.

## Plate Migration Backbone

Plate benefits if raw Slate owns the hotkey matcher because Plate plugins can depend on stable Slate key semantics instead of shipping or re-exporting `is-hotkey`.

Do not make Plate-specific shortcuts part of Slate. The migration backbone is a tested primitive, not Plate's product keymap.

## slate-yjs Migration Backbone

No direct collaboration data-model impact.

Indirect impact: deterministic keyboard command detection matters before operations are generated. Removing `is-hotkey` must preserve undo/redo/delete/move command classification so collaborative operation streams do not change accidentally.

## Regression Proof Matrix

Unit tests in `slate-dom`:

- `mod+b` maps to meta on Apple and ctrl off Apple.
- `cmd+shift+z`, `ctrl+y`, and `ctrl+shift+z` redo rows match current platform behavior.
- `shift?+backspace` and `shift?+delete` match with and without shift.
- arrow movement and shift-arrow extension rows match current behavior.
- Apple ctrl delete/backspace aliases match.
- punctuation example `` mod+` `` works if a public generic matcher is exported for examples.
- non-English keyboard fallback: expected `mod+z` matches an event with `code: "KeyZ"` and non-ASCII `key`, but does not treat Dvorak-style ASCII remapped `event.key` as the physical key.
- Windows AltGr guard: Ctrl+Alt character input should not accidentally fire a normal shortcut.

Integration tests in `slate-react`:

- `getEditableCommandFromKeyDown` still returns history, insert-break, delete, and movement commands for the same rows.
- typing paths do not allocate or parse specs per event.

Example/browser proof:

- rich text example: bold, italic, underline, and code mark shortcuts work.
- iframe example: shortcut import is removed and behavior still works.
- non-Latin layout fallback has at least one synthetic browser contract or jsdom unit if Playwright cannot switch layouts.

Dependency proof:

- `rg "is-hotkey|@types/is-hotkey" /Users/zbeyens/git/slate-v2` only finds historical changelog notes or intentionally archived docs, if any.
- package build no longer prints the known `is-hotkey` external warning.

## Browser Stress / Parity Strategy

Keyboard shortcut behavior is not a 50k-block performance problem, but it is in the event hot path.

Proof rows:

- micro-benchmark the matcher with cached/compiled specs over at least 100k synthetic events;
- verify no per-event parsing by code review and test spy if needed;
- run focused browser rows for richtext and iframe examples;
- keep the Slate v2 `bun check` fast gate after implementation.

## Applicable Implementation-Skill Review Matrix

| Lens | Applicability | Finding | Plan delta |
| --- | --- | --- | --- |
| `slate-ralplan` | applied | This changes a browser-runtime dependency used by Slate's editing kernel. | Decision brief, proof matrix, objection ledger, and scorecard recorded. |
| `performance` | applied | Repeated keydown matching is hot-path work. GitHub-scale lesson applies: make repeated units cheap before adding architecture. | Precompile specs; no per-event parsing; add micro-benchmark row. |
| `performance-oracle` | applied | Complexity must be O(number of shortcut variants for that helper), with no document-size coupling. | Keep tiny compiled matcher and no React/render state. |
| `tdd` | applied | This is behavior replacement under the same API. | Write parity tests before implementation. |
| `vercel-react-best-practices` | applied | Bundle/runtime shape is in scope, but no React render behavior changes. | Remove stale dependency; no hooks/effects; no extra listeners. |
| `react-useeffect` | skipped | No effect, subscription, or derived-state work. | No change. |
| `build-web-apps:shadcn` | skipped | No UI component surface. | No change. |

## High-Risk Deliberate Mode

Triggered because this touches keyboard, selection-adjacent browser runtime behavior.

Pre-mortem:

1. Non-English keyboard users lose common shortcuts because the replacement only matches `event.key`.
2. Dvorak/remapped ASCII users get physical-key behavior when they expect character-key behavior.
3. Windows AltGr input fires Ctrl+Alt shortcuts and corrupts text input.

Proof response:

- borrow Lexical's tested `event.key` first, `event.code` fallback only for non-ASCII single-letter layouts;
- include Dvorak/remapped ASCII and non-English fallback tests;
- include AltGr guard tests;
- route all `slate-react` command classification through the same `Hotkeys` helpers.

Blast radius:

- `packages/slate-dom`
- `packages/slate-react`
- `site/examples/ts/*`
- `docs/general/resources.md`
- root and package manifests
- `bun.lock`

Rollback answer:

- if the matcher fails edge-case parity, keep the public `Hotkeys` API and swap internals back while tests stay; no public user migration required.

## Maintainer Objection Ledger

| Change | Objection | Steelman antithesis | Answer | Verdict |
| --- | --- | --- | --- | --- |
| Remove `is-hotkey` dependency | "Why touch old working keyboard code?" | Keyboard code is fragile and old deps can be okay if tiny. | This dep has no release since 2020, already caused local parse/install pain, leaks into examples, and uses `which` by default. Slate can own this tiny runtime with tests. | keep |
| Do not fork `is-hotkey` package | "A fork is safer than rewriting." | A fork preserves behavior with less code churn. | Forking preserves dated semantics and creates package maintenance. The current grammar is tiny enough to reimplement with parity tests and Lexical's stronger layout behavior. | keep |
| Do not use ProseMirror/Tiptap keymap | "They already solved keymaps." | PM keymap is mature and maintained. | PM solves keymap plugins for PM views. Slate needs a matcher for its editing kernel, not a PM `Plugin`/`EditorView` protocol. | keep |
| Expose direct-only `isHotkey` instead of `createHotkeyMatcher` | "This expands public API." | Examples need a replacement for direct `is-hotkey` usage. | The helper is justified, but public factory/curried shapes are not. `isHotkey('tab', event)` matches the useful old-library DX; private compiled matchers and an internal cache preserve performance. Lexical supports the naming direction by exposing semantic `is*` helpers, not public matcher factories. | keep |
| Add non-English fallback | "This may change behavior." | Any behavioral expansion can surprise someone. | Lexical has exact tests for this class. Current Slate changelog already says the hotkeys util was updated for non-Latin keyboards; this plan makes that contract real. | keep |

## Hard Cuts

- No `is-hotkey` runtime dependency after implementation.
- No `@types/is-hotkey`.
- No ProseMirror `keymap` import.
- No Tiptap keymap copy.
- No effect-based or React-state shortcut handling.
- No per-keydown shortcut parsing.
- No public keymap registry in this slice.

## Implementation Phases

### Phase 1: Red tests

Add `slate-dom` unit tests that freeze the current `Hotkeys` behavior and the desired non-English/Dvorak/AltGr behavior.

Gate:

- tests fail against current or placeholder implementation where behavior is missing;
- tests use public `Hotkeys` where possible and private helper only if necessary.

### Phase 2: Slate-owned matcher

Add `packages/slate-dom/src/utils/hotkey-match.ts` or equivalent.

Gate:

- `hotkeys.ts` no longer imports `is-hotkey`;
- specs compile once;
- platform branching is testable;
- no per-event parsing.

### Phase 3: Example/docs migration

Remove direct `is-hotkey` imports from examples and remove the docs recommendation.

Gate:

- examples either use `Hotkeys`, a Slate-owned generic matcher, or local explicit logic when clearer.

### Phase 4: Dependency removal

Remove `is-hotkey` and `@types/is-hotkey` from root and package manifests; update lockfile.

Gate:

- `rg "is-hotkey|@types/is-hotkey" /Users/zbeyens/git/slate-v2` shows no active dependency/import/doc recommendation.

### Phase 5: Verification

Run:

```bash
bun test packages/slate-dom
bun test packages/slate-react
bun --filter slate-dom typecheck
bun --filter slate-react typecheck
bun --filter slate-dom build
bun --filter slate-react build
bun check
```

Adjust commands to the actual repo scripts when implementing; source-first package checks win over cargo-cult root builds.

Browser proof:

- `/examples/richtext`: mark hotkeys work.
- `/examples/iframe`: iframe hotkey behavior still works.

## Fast Driver Gates

- `Hotkeys` public API unchanged; `isHotkey` is the only generic helper.
- Non-English and remapped keyboard tests are green.
- No active `is-hotkey` dependency remains.
- Build warning for `is-hotkey` disappears.
- Richtext and iframe example keyboard proof passes.

## Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.93 | No React work; hot path stays compiled and event-only. Evidence: current `create()` compiles once at `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/utils/hotkeys.ts:52-65`; plan keeps that property. |
| Slate-close unopinionated DX | 0.94 | Keeps `Hotkeys`; no PM/Tiptap keymap API. Evidence: `Hotkeys` object at `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/utils/hotkeys.ts:72-97`. |
| Plate and slate-yjs migration-backbone shape | 0.90 | No product keymap; deterministic command classification preserved. Evidence: editing kernel command mapping at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/editing-kernel.ts:916-1003`. |
| Regression-proof testing strategy | 0.94 | Explicit red tests for current behavior, non-English fallback, Dvorak, AltGr, examples, dependency sweep. |
| Research evidence completeness | 0.94 | Cites live Slate v2, npm metadata, prior local failure, Lexical, ProseMirror keymap, Tiptap, and `is-hotkey` source. |
| shadcn-style composability and minimalism | 0.92 | No UI/component expansion; possible generic matcher only if examples need it. |

Weighted total: 0.932.

Ready threshold is met for a narrow dependency decision. The implementation-time helper decision is finalized: expose `isHotkey`, reject public `createHotkeyMatcher`.

## Plan Deltas From Review

- Added prior local `is-hotkey` parse failure as evidence, not just package staleness.
- Upgraded the recommendation from "replace stale dep" to "replace with Slate-owned matcher plus Lexical non-English fallback."
- Rejected ProseMirror/Tiptap import paths after reading their live source.
- Kept `w3c-keyname` as a fallback option, not the first choice.
- Added explicit Dvorak/non-English/AltGr proof rows.

## Open Questions / What Would Change The Decision

- If tests show `w3c-keyname` handles browser key naming better with less code and no regressions, use it as a tiny dependency under the Slate-owned matcher.
- If examples genuinely need arbitrary user shortcuts, expose `isHotkey`; keep the compiled matcher private.
- If non-English fallback creates conflict with user-visible shortcut expectations, follow Lexical's exact distinction: ASCII remapped layouts use `event.key`, non-ASCII letter layouts may fall back to `event.code`.

## Pass Schedule And State

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Current-state and evidence | complete | Live Slate v2 usage, package deps, npm freshness, prior local failure, Lexical/ProseMirror/Tiptap/`is-hotkey` source. | Chose Slate-owned matcher. | Public helper finalized as `isHotkey`. | Implementation |
| Intent and decision brief | complete | Intent/boundary record and options matrix. | Reject keep/fork/PM/Tiptap. | none | Implementation |
| Risk and proof pass | complete | High-risk keyboard pre-mortem and regression matrix. | Added Dvorak/non-English/AltGr rows. | none | Implementation |
| Closure score | complete | Scorecard total 0.915 with no blocker for narrow dependency decision. | Ready for implementation. | none | Implementation |

## Final Handoff Outline

Accepted decisions:

- Replace `is-hotkey`.
- Do not fork it.
- Do not import ProseMirror/Tiptap keymap.
- Keep `Hotkeys` stable.
- Implement a Slate-owned matcher with Lexical-style layout fallback and ProseMirror-style `Mod` grammar discipline.
- Remove example/docs recommendations for `is-hotkey`.

Implementation starts with tests, not a dependency deletion.

## Completion Gates

- Plan is ready.
- Implementation not started in this ralplan pass.
- `.tmp/completion-check.md` may be set to `done` for this planning lane because no further autonomous plan review is needed; the next runnable work is implementation, which requires a `go`/execution turn.

## Execution Ledger

### 2026-05-03 hotkey hard cut started

Status: in progress  
Driver skill: `ralph`  
Supporting skills: `hard-cut`, `tdd`

Actions:

- Reopened `.tmp/completion-check.md` as `pending`.
- Refreshed `.tmp/continue.md` for the implementation lane.
- Read relevant solution notes before implementation:
  - history hotkeys need real keyboard proof;
  - hard cuts need explicit contract/test files, not only default discovery;
  - local Bun/node_modules failures should be treated as install corruption before product rewrites.

Next action:

- Add focused hotkey parity tests in `../slate-v2`, then replace the matcher and remove the dependency.

### 2026-05-03 hotkey hard cut completed

Status: complete  
Driver skill: `ralph`  
Supporting skills: `hard-cut`, `tdd`, `ce-compound`

Actions:

- Added Slate-owned hotkey matcher tests in `../slate-v2/packages/slate-dom/test/hotkeys.ts`.
- Added Slate-owned matcher internals in `../slate-v2/packages/slate-dom/src/utils/hotkey-match.ts`.
- Rewired `Hotkeys` to the Slate-owned matcher while preserving the public `Hotkeys` surface.
- Migrated active examples and docs from `is-hotkey` to Slate-owned hotkey helpers.
- Removed `is-hotkey` and `@types/is-hotkey` from active manifests and `bun.lock`.
- Captured the reusable hard-cut learning in `docs/solutions/developer-experience/2026-05-03-slate-hotkey-dependency-hard-cuts-need-owned-matchers-and-layout-contracts.md`.

Verification:

- `bun test ./packages/slate-dom/test/hotkeys.ts` passed.
- `bun test ./packages/slate-dom/test/hotkeys.ts ./packages/slate-react/test/editing-kernel-contract.ts` passed.
- `bun test ./packages/slate-dom/test/hotkeys.ts ./packages/slate-dom/test/bridge.ts ./packages/slate-dom/test/dom-coverage.ts ./packages/slate-dom/test/clipboard-boundary.ts` passed.
- `bun --filter slate-dom typecheck` passed.
- `bun --filter slate-react typecheck` passed.
- `bun --filter slate-dom build` passed.
- `bun --filter slate-react build` passed.
- `bun typecheck:site` passed.
- `bun lint:fix` passed.
- `bun check` passed.
- Browser proof passed for `/examples/richtext` and `/examples/iframe` shortcut handling.
- Active dependency sweep is clean; only a historical `packages/slate-react/CHANGELOG.md` mention remains.

Completion decision:

- The hard cut is complete.
- `.tmp/completion-check.md` may be set to `done`.

### 2026-05-03 upstream is-hotkey test backfill

Status: complete

Actions:

- Read `../is-hotkey/test/index.js` after the dependency clone was available.
- Backfilled valuable public behavior rows into `../slate-v2/packages/slate-dom/test/hotkeys.ts`:
  - aliases for `cmd`, `space`, and `+`;
  - question mark and non-ASCII key matching;
  - multi-hotkey specs;
  - exact modifier rejection;
  - optional modifier matching;
  - platform-specific `mod`;
  - modifier-only keydown matching;
  - malformed modifier grammar rejection.
- Updated `../slate-v2/packages/slate-dom/src/utils/hotkey-match.ts` to support modifier-only keydown and clearer invalid modifier errors.
- Updated the solution note with the backfill rule.

Verification:

- `bun test ./packages/slate-dom/test/hotkeys.ts` passed.
- `bun test ./packages/slate-dom/test/hotkeys.ts ./packages/slate-react/test/editing-kernel-contract.ts` passed.
- `bun --filter slate-dom typecheck` passed.
- `bun lint:fix` passed.
- Active dependency sweep still only reports the historical changelog mention.

### 2026-05-03 hotkey public API finalized

Status: complete

Decision:

- Public generic helper is `isHotkey`, not `createHotkeyMatcher`.
- `isHotkey('mod+s', event)` is supported for direct checks.
- Public curried usage is rejected: `const isSaveHotkey = isHotkey('mod+s')` is overkill.
- Platform options stay available: `isHotkey('mod+s', { platform: 'apple' }, event)`.
- Compiled matchers remain private for semantic `Hotkeys`, and direct `isHotkey(...)` calls use an internal cache.

Why:

- The old `is-hotkey` library's best DX was the direct `isHotkey(spec, event)` call shape.
- Lexical exposes semantic `is*` utilities and key commands, not public curried matchers.
- Slate should keep `Hotkeys` for editor semantics and `isHotkey` for unopinionated custom shortcuts.

Actions:

- Replaced public `createHotkeyMatcher` exports with `isHotkey`.
- Updated active examples and docs to import `isHotkey`.
- Added direct-call coverage for `isHotkey('tab', event)` and platform-specific direct checks.

### 2026-05-04 hotkey curried API hard cut

Status: complete

Decision:

- `isHotkey` is direct-only public API.
- Private compiled matchers still support Slate's built-in semantic `Hotkeys`.
- Direct custom checks use an internal cache so examples stay simple without reparsing on every keydown.

Actions:

- Removed the public `isHotkey(spec)` overload.
- Updated active examples and docs to use `isHotkey(spec, event)` only.
- Updated hotkey tests to cover the surviving public direct API.

### 2026-05-04 React event and upstream is-hotkey review pass

Status: complete

Decision:

- `isHotkey` accepts a structural `KeyboardEventLike`, not only the DOM `KeyboardEvent`.
- React examples should pass the React keyboard event directly, not `event.nativeEvent`.
- `../is-hotkey` behavior was reviewed again. Keep useful alias and optional-modifier behavior; continue rejecting curried checks, `which`/keyCode mode, `byKey`, parser exports, `isCodeHotkey`, and `isKeyHotkey`.

Actions:

- Exported `KeyboardEventLike` from `slate-dom`.
- Removed `nativeEvent` from active `isHotkey` example call sites.
- Backfilled extra upstream-inspired rows for direct event-like objects, `cmd+=`, `return`, `esc`, `spacebar`, function keys, `pageup`, and optional `mod?`.
