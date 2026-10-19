---
review_scopes: [documents]
work_kind: implementation
---

# DOCX export: Word list numbers follow Plate's list numbers

Status: executed: uncommitted on next, waiting on your commit
Playbook: bug-fix

Opened by the list review (`docs/plans/2026-10-10-list-review.md`), whose explorer census found that DOCX export cannot show the numbers Plate derives for lists. That defect is owned here, outside the list plan.

## Brief

### What will change?

Done, uncommitted. Numbered paragraphs now export with the editor's numbers: starts, restarts, roman markers and indent levels, at any indent size. A separate list no longer continues an earlier one. Pages shows this; Word itself wasn't run.

### What could go wrong?

A list that starts right where an earlier one stopped joins that Word list, with the right numbers. Each separate list adds about 2.6 KB to the file. Numbered headings, quotes, bullets and task items are a follow-up.

## Teach

Word doesn't store a number on each list paragraph. Each numbered paragraph points at a numbering definition, and Word counts paragraphs as it goes. Plate exports every numbered block as its own one-item HTML list that already carries the right number.

The converter threw that number away. It read the start from an attribute nothing writes, so every Word list began at 1. It also merged every list at the same depth into one Word list for the whole document. Nesting depth came from a margin on the inner list, which the live editor never renders.

Now the converter continues an open Word list only when that list would print the block's number next. Otherwise it starts a new Word list at that number. Depth comes from the block's own indent.

## Demo

1. Open the exported file from before the fix, `docs/plans/artifacts/2026-10-10-docx-list-numbering/docx/before-live.docx`, in Word or Pages. Every numbered item counts 1 to 9 in one list, the nested item sits flat and the roman item shows 9.
   ![before](artifacts/2026-10-10-docx-list-numbering/pages/before-live.jpg)
2. Open the file from after the fix, `docs/plans/artifacts/2026-10-10-docx-list-numbering/docx/after-live.docx`. You should see 3, 4, then 1, 2, then 1, a nested 1, 2, 7 and a roman i, the same numbers the editor shows.
   ![after](artifacts/2026-10-10-docx-list-numbering/pages/after-live.jpg)
3. Click at the end of item b and press Enter. The new item gets 5, and the list after the gap still starts at 1.
   ![after](artifacts/2026-10-10-docx-list-numbering/pages/after-live-enter-after-b.jpg)

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Zero and negative start numbers | Sent to Word as written, unchecked in any app | Turned into zero | clamp negative starts | detail |
| Bullet lists at one level and style | Share one Word list across the whole export, gaps included | One Word list per bullet list | split bullet lists | detail |
| Numbered headings and quotes, bullets and task items | A separate follow-up fix | Fixed in this change | fix list hosts now | small |
| Word list definitions | One full definition per separate list, about 2.6 KB each | One shared definition with a start override per list, much smaller | share list definitions | small |
| The documents page link | A new page, because the old link (claude.ai/artifact/W8q2wJUFCojpcaJeSzhJQb) no longer opens | Keep only the old link | drop the new documents page | detail |

## Main changes

- The DOCX converter keeps its open Word lists per export instead of in module state shared by every export.
- A list continues an open Word list only when its start number is the number that Word list prints next, at the same level and marker style. The old reset rule that guessed list boundaries from neighboring HTML elements is gone.
- A list's level reads the host block's `editor-indent-N` class, else the list's own left margin, else the host's, so the static list wrapper no longer adds an inner margin.

## Close

What landed, uncommitted in the working tree on `next`:

- The converter fix in `packages/platejs/src/docx/export/lib/internal/`. `docx-document.ts` writes `w:start` from the list's `start` attribute and owns `openList`. `xml-builder.ts` `buildList` takes the host block, reads the level and counts the numbered paragraphs it writes. `render-document-file.ts` drops the module-level tracking and the reset heuristic and passes each list its host.
- `apps/www/src/registry/components/editor/block-list-static.tsx` drops the inner list margin and its `indent` plumbing, and imports React like every other static component, with the regenerated registry output and the `2026-10-10-fix-static-list-indent` changelog entry.
- Tests: `apps/www/src/__tests__/package-integration/docx/list-numbering.spec.tsx` (new; the numbering case on the static and live list kits, plus the custom-indent case) and the overlap case in `packages/platejs/src/docx/export/lib/html-to-docx.spec.ts`. The tracking-helper case in `render-document-file.spec.ts` went with the helpers.
- One sentence in `.changeset/docx-package-topology.md`, the unreleased `platejs` changeset that introduces `platejs/docx/export`.

Deviations and reversals:

- The design came from a three-runner `architect` (Opus, Astra, Sol) with an Opus cross-judge. All three converged; the judge picked the Opus base. Two runners split bullet lists per item; the build shares one Word list per level and style across the export, per the judge, because splitting writes one numbering definition per task item.
- `block-list-static.tsx` also gained `import * as React from 'react'`. Bun runs registry files with the classic JSX runtime, so the static numbered wrapper threw under test without it. That edit landed while the architect runners were still reading the tree.
- The overlap test was not in the brief. The cross-judge flagged module state shared across exports, and a probe showed base writing a paragraph that points at a numbering id its own file never defines.
- The decision-trail review (Codex Sol) reopened three things. Acceptance now also ran in a detached worktree with only this task's files. The performance probe it found missing now ran. Its custom-indent point turned out to be a real regression: with a 40px indent, the first build exported the static kit's levels as 1, 2, 1 where base gave 0, 1, 0. Levels now come from the host's `editor-indent-N` class, with a second regression test.
- The separate `platejs` patch changeset became one sentence in the existing topology changeset, because `platejs/docx/export` is not in the last published `platejs`.

Proof and its limits, from the decision log's `scope:` rows:

- The first regression test reads the Word numbering out of `numbering.xml` and `document.xml`. It compares each numbered paragraph's number with `read.ordinal`, and its level, format and Word list with fixed expectations. Its number assertions failed at base (`test-before-a5.log`: a=1 instead of 3, c=3 instead of 1, h decimal 7 instead of roman 1), and its list-group assertions failed at base too (`test-before-a6.log`).
- The custom-indent test failed on the first build (levels 1, 2, 1) and passes after the indent-class fix. The overlap test fails at `666f02406e` and passes after.
- Six single-anchor mutants on the final freeze `49de35c2ed` each turn a test red: start ignored, always continue, never continue, paragraphs uncounted, indent class ignored, open lists shared across exports.
- Isolated acceptance in a detached worktree, base plus only this task's files, passes every command with exit 0. At `b8e0db036e`, which holds the final source bytes, it covers `html-to-docx.spec.ts` (5), the docx export partition (129), the slow docx, list and static-HTML lanes (52 and 41), base's www list spec (3) and the docx export typecheck (`iso-*-a2.log`). At the final freeze `49de35c2ed`, which only adds the live-kit test case, it covers the regression test file (3 cases) and the www package-integration typecheck (`iso-*-a3.log`). `pnpm check registry-changelog` ran only on the checkout, because it checks generated output that the freeze leaves out.
- Both list kits export identical numbering. Probes on both kits at 24px and 40px indents give levels 0, 1, 0 after the fix; base flattened the live kit to level 0 at any offset.
- Pages renders the fixed export as 3, 4, 1, 2, 1, nested 1, 2, 7, i, and pressing Enter after b gives 5 while the next list stays at 1. Word itself was not available, so no Word run backs these claims.
- Performance probe (owner microbench of the converter, frozen budget in `docs/plans/artifacts/2026-10-10-docx-list-numbering/perf/probe-plan.md`), run with host load 7.3 to 8.6 on 18 cores, under the frozen 0.7 × cores limit:
  - Base and the fix write byte-identical `numbering.xml` for one 2,000-item list, one 10,000-item list and 1,000 plain HTML lists.
  - Their medians of 7 interleaved runs match: 61.7 against 62.5 ms, 298.6 against 295.7 ms and 206.0 against 204.9 ms, with an identical-build control at 63.5 ms.
  - 1,000 separate Plate lists now write 1,000 Word list definitions, 2,629,270 bytes of `numbering.xml` in 215.2 ms. That is the same size and time base already spent on 1,000 plain lists. Base wrote a single definition for them, which was the defect, in 78.9 ms.
  - A planted double conversion and a known-bad input that restarts every item both fail their lines.
  - An earlier run on a host loaded above the limit was logged inconclusive for timing; its byte counts matched.
- Five Word fixtures still round-trip with every indent and ordinal unchanged.
- Zero and negative starts go to Word as written; no Word or Pages run checked how they display.
- Word list grouping follows adjacency at one level and marker style, not list identity. Two lists interleaved at one level show the right numbers, but a later item can join the other list's Word list (inferred from `openList`, not run). The list session's planned list identity would let the exporter key Word lists on it.
- The margin fallback in `getIndentLevel` has no test of its own: it serves hosts without an indent class, such as an indent plugin configured with custom class names.

Counts: 18 asks and gates, 17 done and 1 skipped (a PR, which the Delivery rule leaves to the owner). Still open: the 5 open work items below and the 17 reflect Backlog items.

Open work, tracked in the `documents` subject's Open work:

- Numbered headings export as an empty paragraph, numbered quotes lose their number, bullets export with no Word bullets, and each task item gains an empty bullet paragraph. owner: zbeyens. stop: a list-host follow-up lands with a failing-first test per case, or the owner drops it.
- Zero and negative list starts go to Word unchecked. owner: zbeyens. stop: a Word run on an export with each, or the owner drops it.
- The converter writes 8 list levels (`ilvl` 0 to 7) while `getIndentLevel` has no upper bound (inferred from source by the cross-judge, not run). owner: zbeyens. stop: a deeper-than-8 export is checked and capped, or the owner drops it.
- The DOCX file is zipped without compression (`generateAsync` passes no `compression`), so each separate list's 2.6 KB definition lands in the file as is. owner: zbeyens. stop: the writer deflates the package or shares list definitions, or the owner drops it.
- `getIndentLevel` repeats the indent plugin's 24px default offset and the root list indent of 1 as literals; naming them needs an export from the indent plugin. owner: zbeyens. stop: the indent plugin exports its default offset, or the owner drops it.

## Reflect

One Opus reviewer ran the judgment, tooling and divergent lenses over the session (`docs/plans/artifacts/2026-10-10-docx-list-numbering/reflect/reply.md`), and the lead synthesized.

Applied in this run: the numbering regression test now also runs on the live list kit, the one the export toolbar uses. It failed at base on the defect itself (a=1 instead of 3, every item in one Word list, e at level 0).

Accepted, then moved to Backlog, because none is a helper fix for a refused allowed case or a rewording with no net words. Each has owner: zbeyens and stop: the owner takes or drops it.

- Write the fallback todo list at intake, with every gate the rules trigger.
- Pick the detached-worktree acceptance venue at intake when `git status` shows other sessions' edits in files the tests load (`verify`).
- Back a "base already did this" claim with a base probe of that exact case (`verify`).
- Treat a comment that names an assumption the change newly depends on as a proof item (`no-comments`).
- Map each touched entrypoint to the changeset that introduced it before writing a new one (`changeset`).
- Name export and serializer payload changes in `benchmark`'s description.
- Name throwaway reproduction probes in `verify`'s description.
- Say "pending audit" in any status reply sent before the decision-trail review returns.
- Make `cross.mjs --help` print usage instead of calling a seat, and let `freeze.mjs` stage a named deleted path. Both are shared helpers, so the fix goes through `sync-pstack`'s Lesson mode.
- Ask a seat for its full deliverable in the reply, not in a file of its own.
- Type the converter's html-to-vdom properties from the real output, which puts `class` in `attributes.class` and `start` in `properties.start`.
- Add a lint that requires the React namespace import in JSX-bearing registry static components.
- Add Pages as the local DOCX renderer to `verify`'s recipes.
- After `build:registry`, list the run's own generated files and attribute the rest.
- Add a hook that denies inline `sed` or `python` text edits.
- Hold `architect` drafting until every candidate has answered.
- Ask the list redesign for the indent level as data next to the list id, so export stops reading a styling class.

Rejected:

- Waiting on an agent by watching its output file is already covered by the Agent tool's own notice.
- "Keying continuation on the start number is a second sequence algorithm": the request asked to key Word lists from the emitted start, the identity limit is recorded, and the list-id hand-off owns the fix.
- "Prose passes ran before the prose existed": AGENTS.md's Writing passes rule already ties the pass to the final bytes, and this run reran it.
