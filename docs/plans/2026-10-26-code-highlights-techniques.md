---
review_scopes: [code]
verdict: stop
review_basis: [2026-10-04-code-audit]
review_commit: fb662025430064c2bcf5f397c5e5b3ab15d48bd3
review_inputs: [docs/plans/2026-10-26-diffs-highlights-intake.md, docs/plans/2026-09-06-code-block-plate-plite-tiptap-perf-audit.md, docs/plans/2026-10-16-code-block-10k-typing.md, docs/research/sources/plite/performance.md, packages/plitejs/src/react/decoration-source.ts, packages/plitejs/src/range-projection.ts, apps/www/src/registry/components/editor/code-block-lowlight.ts, apps/www/src/registry/examples/values/huge-code-block-value.tsx]
review_upstreams: ['../pierre@f3afb935f699c71f6e36c5b714205dc05d2e0043']
---

# Code: which Highlights techniques to steal

Status: closed: Stop verdict
Topic: code
Playbook: verdict

**Stop. Plate keeps Lowlight and copies nothing from Highlights, because highlighting is only about a tenth of each keystroke in a huge code block.** In Chromium, one key in the 10,000-line demo spent 112 to 138 ms in Lowlight out of 1,203 to 1,512 sampled ms. So even a highlighter that took no time would save about 11% at most, and a speed change has to win 20%. Highlights' best trick, re-reading only the lines an edit touched, cannot run on Lowlight anyway, because highlight.js cannot pick up in the middle of a text. The same profile showed where the time goes. Since cf15725603, Plite works out all 30,000 syntax ranges again on every key, about 30% of the key. A throwaway fix cut each key's script time by about a third. Task t_31c0b52b owns that fix.

## Brief

### What will change?

Code blocks keep Lowlight. One new task fixes a slowdown from September 30 that costs about a third of each keystroke's script time, and another asks you whether to keep Auto language detection.

### What could go wrong?

The timings come from a busy machine, so trust the shares, not the absolute times. Once the rest of a key gets faster, Lowlight's share grows, and a faster highlighter could matter again.

## Teach

On each key in a code block, Plate hands the whole block's text to Lowlight, which returns about 30,000 colored pieces for the 10,000-line demo. Plate turns them into color ranges, and Plite works out where each range sits on screen. When a piece did not change, Plate keeps its range, so Plite can reuse its earlier work.

Highlights is fast because its lexers are hand-written WebAssembly and because it remembers how each line ended. After an edit it re-reads lines only until one ends the same way as before. That second trick needs a highlighter that can pick up in the middle of a text from a saved state, and highlight.js, which Lowlight wraps, cannot.

Since September 30 the code reader reads the whole block instead of its text. Plite reuses a range only when the reader was given a text, so now it works out every range again on each key.

## Public API

No public call changes, and the kit keeps building Lowlight. The after is this review's sketch of the rejected option, an object in the same `lowlight` slot that uses Highlights where it has a lexer and Lowlight for the rest.

```ts before
// apps/www/src/registry/components/editor/code-block.tsx
const lowlight = createCodeBlockLowlight();

export const CodeBlockKit = [
  createCodeBlockPlugin(CodeBlockElement),
  CodeHighlightPlugin.configure({
    initialState: { lowlight },
  }),
];
```

```ts after
// a sketch of the rejected engine lane; no source holds it
const lowlight = createHighlightsLowlight({
  fallback: createCodeBlockLowlight(),
});

export const CodeBlockKit = [
  createCodeBlockPlugin(CodeBlockElement),
  CodeHighlightPlugin.configure({
    initialState: { lowlight },
  }),
];
```

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Highlighter | Keep Lowlight and copy nothing from Highlights | Use Highlights where it can, and Lowlight for the rest | highlights adapter | big |
| The September 30 slowdown | A separate task fixes it | Fix it in this run | build now | big |
| That task's priority | Top priority, because it is a slowdown with a known cause | One step lower | p1 projection | detail |
| Auto language detection | Kept for now, and a separate task asks you whether to cut it | Cut it in this run | cut auto | small |
| More work on this question | Hold | Review again, or have other models challenge it | again, interrogate | small |

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata through the session tool.

### Requirements

- One newline-bearing Text per code block, with transient syntax paint that never enters the document ([code subject](topics/code.md), Layer and owner).
- A performance change must win at least 20% and 16 ms on edit or settlement, with no material loss elsewhere ([2026-09-06 plan](2026-09-06-code-block-plate-plite-tiptap-perf-audit.md), Frozen benchmark and acceptance contract).
- No viewport-only highlighting, no line nodes and no highlighting cutoff above a size ([performance page](../research/sources/plite/performance.md), the 2026-09-09 code highlighting entry; [VISION.md](../../VISION.md), its rule against hiding latency behind delayed repair).
- An incremental native parser needs a matched benchmark and full language and rendering oracles first ([code subject](topics/code.md), Rejected).
- A backend must be a complete public surface, and speed alone earns no public provider ([common.md](../vision/common.md), Taste).
- The owner said on 2026-10-26 that Auto language detection does not matter here and is costly.

### What the code does

- The reader highlights the whole block with Lowlight on each text change, then rebuilds its range list, keeping a range object when the token did not move and giving every token after the edit a new range with shifted offsets (`packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts:989-1193`).
- Since cf15725603 (2026-09-30) the reader takes the block's entry, where before it took each code text's entry (`git show cf15725603` on that file).
- Plite reuses a compiled range by object identity only when the input is a Text and the range sits on it (`packages/plitejs/src/react/decoration-source.ts:646-706`). A block input skips that, so every range goes through `projectRangeInSnapshot` (`packages/plitejs/src/range-projection.ts:16-68`), which walks the tree twice, iterates texts through a generator and copies the range for its one-entry cache.
- highlight.js 11.11.1's public `highlight()` takes no continuation; only its internal `_highlight` resumes from a saved mode (`lib/core.js:1688` and `:1738`). Lowlight 3.3.0 calls the public one (`lib/index.js:82-97`).
- Highlights' `LiveTokenizer` keeps each line's tokens and end state and reports changed line spans. `getLineRecords` returns token ids that `tokenNames` maps to names such as `keyword` and `function`, so a class-based theme could survive an engine swap (`../pierre@f3afb935:packages/highlights/lib/live.ts:95-110`, `:458`; `lib/token-types.ts`).

### Measurements

The host ran at load 130 to 280 throughout, so every comparison below interleaves or alternates its sides, and only shares and gaps count.

- **Chromium, one key.** The 2026-10-16 browser probe typed six keys at the end of the 10,000-line demo against the www Plite dev server serving package source. Key 1's CPU profile, in three base runs, gave Lowlight 112 to 138 ms of 1,203 to 1,512 sampled ms. Plite's `compileInput` took 397 to 552 ms, and `projectRangeInSnapshot` 334 to 466 ms of that. Plate's reader outside Lowlight took about 7 ms.
- **The throwaway projection fix.** A single-text fast path at the top of `projectRangeInSnapshot` ran in two alternating rounds against the base. The median script per key went from 0.958 and 0.901 s to 0.613 and 0.596 s, and the median time to the painted frame from 1,248 and 1,176 ms to 884 and 866 ms. `compileInput` fell to 73 to 77 ms. All runs kept the typed text. The run reverted the patch.
- **Engines in Bun, interleaved, 15 samples.** On the demo's 448,889 characters, the p50 was 1,185 ms for Lowlight, 12 ms for Highlights 0.2.0's full pass and 0.07 ms for its live tokenizer on one typed key, which re-read one line. Opening a block comment re-read 9,990 lines in 5.7 ms. Lezer took 456 ms for a full parse, 0.67 ms for an incremental key and 84 ms to list every styled range. Bun runs JavaScriptCore, where Lowlight ran about eight times slower than in Chromium's profile, so these ratios overstate a swap's gain in the browser.
- **Range counts.** Lowlight gave 30,000 ranges on the demo and 17,062 on 10,000 lines of platejs source. Lezer's class highlighter gave 110,000 and 49,629. Merging equal adjacent classes across spaces saved none on the demo and 308 on the source.
- **Auto.** On the demo's first 1,000 lines, Auto took 11.6 to 17.1 s per pass in Bun, against 67 to 228 ms for TypeScript, because it runs all 192 registered grammars. It picked CSS.
- **Languages without Auto.** Highlights 0.2.0 lacks 28 of the picker's 86 distinct languages. Its main branch at f3afb935, with 120 languages, lacks 23.

### Lanes

1. **Keep Lowlight and fix the September 30 slowdown. Wins.** Lowlight costs about a tenth of a key. The re-checking of every range cost about three times that, and a small Plite change removes most of it. Task t_31c0b52b owns it.
2. **Put Highlights behind the existing `lowlight` slot. Loses for now.** It changes no public call, and it can keep class-based themes through its token names, with Lowlight for the 23 to 28 missing languages, Auto and blocked WebAssembly. But with Lowlight at 9 to 13% of a key, it saves at most about 11 to 15%, below the 20% gate. It would ship two engines, about 85 kB more gzipped WebAssembly, and colors whose token edges differ from highlight.js, on a beta API.
3. **Copy the line-state resume onto Lowlight. Loses.** highlight.js has no public way to resume from a saved state, and the 2026-09-06 plan already rejects reparsing single lines without one.
4. **Use Lezer, already a dependency of the CodeMirror view, as the native engine. Loses for now.** Its incremental key is under a millisecond on the demo, but it hits the same 10% ceiling, its class highlighter gives 3.7 times as many ranges for Plite to paint, and its languages and token classes differ. The code subject's rejection stands.
5. **Merge equal adjacent styles to cut ranges. Loses.** It saved 0% and 1.8%. Highlights merges equal colors, which needs the theme while tokenizing, and Plate themes with CSS classes.
6. **Re-highlight the visible lines first in small time slices. Loses.** The rules above forbid viewport-only paint and delayed repair.
7. **Splice only changed lines into the previous ranges. Loses.** Every token after an edit needs a new range anyway, because offsets count from the start of the one Text. The reader's own work outside Lowlight is already about 7 ms of a key.
8. **The strongest deletion, cutting Auto. Not taken here.** It removes the worst case, seconds per key, but no one asked to remove it, so task t_b2f9d9c5 asks the owner.

**Proof limits.** Every timing ran on a loaded host and a dev server, not a production build. The browser runs typed at the end of the block, so a key in the middle was not timed in the browser. The projection fix was a throwaway patch with no test, and it was not checked for correctness beyond the typed text matching. Highlights' output was never compared with Lowlight's colors.

### Dependents

- `basic`, `distribution`, `documents`, `editing`, `link`, `list`, `math`, `persistence`, `react` and `ui`: unaffected, because a Stop changes no source.

### History

- This review supersedes 2026-10-04-code-audit as the scope's head, because it judges a question that audit did not, which highlighter technique to adopt. The audit's contract stands.
- [2026-10-26-diffs-highlights-intake](2026-10-26-diffs-highlights-intake.md) closes its item 2 here as a Stop, because Lowlight is under a fifth of a key. This review weighed its item 1 again without Auto, and it stays a Stop.
- [2026-09-06 plan](2026-09-06-code-block-plate-plite-tiptap-perf-audit.md): its deferred parser decision stands. Its reuse of 30,002 of 30,003 compiled ranges per key regressed in cf15725603.
- [2026-10-16 plan](2026-10-16-code-block-10k-typing.md): the second cost its Open work suspected is this projection cost. Task t_7f07d1f3 now times typing after t_31c0b52b lands.
- External checkout: `../pierre` at `f3afb935f699c71f6e36c5b714205dc05d2e0043`, read on 2026-10-26.

## Close

**Stop. Plate keeps Lowlight and copies no technique from Highlights.** Lowlight is about a tenth of a key in a huge code block, Highlights' line-state trick cannot run on it, and its other techniques either save nothing here or break the paint rules. Since September 30, most of the lost time goes to Plite working out every syntax range again on each key.

This run landed this review page, its decision log, an update to the code subject and the Plite performance research page, and 23 new rows in the research repository list. No code changed. The proof is the source reads above, a Bun engine probe, six browser CPU profiles and two alternating rounds of the throwaway projection fix. The run offered two tasks, t_31c0b52b for the projection fix and t_b2f9d9c5 for Auto, and folded a note onto t_7f07d1f3 so it times typing after the fix.
